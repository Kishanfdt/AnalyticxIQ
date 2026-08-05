import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Play,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: 'products' | 'customers' | 'sales';
  title: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, resource, title }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);

  // 1. Setup Axios upload mutation
  const { mutate: performImport, isPending: isImporting } = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append('file', uploadFile);

      // Simulate progress tracker
      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(95, p + 15));
      }, 200);

      try {
        const response = await api.post(`/import/${resource}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        clearInterval(interval);
        setUploadProgress(100);
        return response.data.data;
      } catch (err: any) {
        clearInterval(interval);
        setUploadProgress(0);
        throw err;
      }
    },
    onSuccess: (data) => {
      setImportSummary(data);
      if (!data.success && data.invalidRows) {
        setInvalidRows(data.invalidRows);
      } else {
        setInvalidRows([]);
        // Invalidate corresponding listing queries
        queryClient.invalidateQueries({ queryKey: [resource] });
        queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-products'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-customers'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-categories'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });
      }
    },
    onError: (err: any) => {
      setImportError(err.response?.data?.message || 'File upload failed. Please verify format.');
    },
  });

  if (!isOpen) return null;

  // File drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Preview parsing: reads the first 5 records client-side before upload
  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setImportSummary(null);
    setImportError(null);
    setInvalidRows([]);
    setUploadProgress(0);

    const name = selectedFile.name.toLowerCase();

    if (name.endsWith('.csv')) {
      const text = await selectedFile.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (results) => {
          if (results.data.length > 0) {
            setPreviewHeaders(Object.keys(results.data[0] as any));
            setPreviewRows(results.data);
          }
        },
      });
    } else if (name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (json.length > 0) {
          const headers = json[0] as string[];
          const rows = json.slice(1, 6).map((rowArr: any) => {
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = rowArr[idx] || '';
            });
            return rowObj;
          });
          setPreviewHeaders(headers);
          setPreviewRows(rows);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleStartImport = () => {
    if (file) {
      performImport(file);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setImportSummary(null);
    setImportError(null);
    setInvalidRows([]);
    setUploadProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-[#0c0c0f] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-zinc-500">
              Upload bulk data records via CSV or Excel sheets
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic States */}
        {!file ? (
          // Dropzone
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-zinc-850 bg-[#16161c]/30 hover:border-zinc-700 hover:bg-[#16161c]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <UploadCloud className="h-10 w-10 text-zinc-500 mx-auto mb-4" />
            <p className="text-sm font-semibold text-white">Drag & drop your files here</p>
            <p className="text-xs text-zinc-500 mt-1">
              Accepts raw CSV (.csv) or Excel worksheets (.xlsx)
            </p>
          </div>
        ) : (
          // File preview & actions
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#16161c] border border-zinc-800 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                {file.name.endsWith('.xlsx') ? (
                  <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
                ) : (
                  <FileText className="h-8 w-8 text-blue-400" />
                )}
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-[280px]">
                    {file.name}
                  </div>
                  <div className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              {!isImporting && !importSummary && (
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Change File
                </button>
              )}
            </div>

            {/* Preview Section */}
            {previewRows.length > 0 && !importSummary && !isImporting && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Data Preview (First 5 Rows)
                </h4>
                <div className="overflow-x-auto border border-zinc-800/80 bg-zinc-950/20 rounded-xl">
                  <table className="w-full text-left text-[10px] border-collapse min-w-[400px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#16161c]/40 text-zinc-400 uppercase">
                        {previewHeaders.map((h) => (
                          <th key={h} className="p-2">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-zinc-300">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/5">
                          {previewHeaders.map((h) => (
                            <td key={h} className="p-2 max-w-[120px] truncate">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Loading/Progress Bar */}
            {isImporting && (
              <div className="space-y-3 py-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <div className="text-sm text-zinc-400 font-medium">
                  Uploading and executing rollback safety checks...
                </div>
                <div className="w-full bg-[#16161c] rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {importError && (
              <div className="flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {/* Success Summary */}
            {importSummary?.success && (
              <div className="bg-emerald-950/15 border border-emerald-800/30 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle className="h-7 w-7" />
                  <div>
                    <h4 className="text-base font-bold text-white">Import Complete</h4>
                    <p className="text-xs text-zinc-500">
                      The batch import was committed successfully
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#16161c]/40 border border-zinc-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Imported Rows
                    </span>
                    <span className="text-xl font-bold text-white">
                      {importSummary.importedCount}
                    </span>
                  </div>
                  <div className="bg-[#16161c]/40 border border-zinc-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Duplicates Skipped
                    </span>
                    <span className="text-xl font-bold text-white">
                      {importSummary.duplicatesCount || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all mt-2"
                >
                  Close Window
                </button>
              </div>
            )}

            {/* Invalid Row Report (Validation Errors) */}
            {importSummary && !importSummary.success && (
              <div className="space-y-4">
                <div className="flex gap-2.5 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-5 rounded-2xl">
                  <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Import Rejected (Rolled Back)</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                      No rows were imported. We encountered validation failures listed below. Please
                      fix these rows in your source sheet and retry upload.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Row Error Report ({invalidRows.length} errors)
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-zinc-800 bg-zinc-950/15 rounded-xl divide-y divide-zinc-850">
                    {invalidRows.map((err, idx) => (
                      <div key={idx} className="p-3 flex items-start justify-between text-xs gap-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            Row {err.rowNumber}
                          </span>
                          <span className="text-zinc-300 font-medium">{err.reason}</span>
                        </div>
                        {err.sku && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            SKU: {err.sku}
                          </span>
                        )}
                        {err.email && (
                          <span className="text-[10px] text-zinc-500 font-mono">{err.email}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-300 rounded-xl text-sm font-semibold transition-all"
                  >
                    Upload Corrected File
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Start Button */}
            {!isImporting && !importSummary && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/40">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleStartImport}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 font-semibold text-xs transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Import Process</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
