import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services';
import { DeleteSaleConfirmModal, ImportModal } from '../components';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  User,
  ShoppingBag,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';

export const SalesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10; // Items per page

  // Data Ops States
  const [exportOpen, setExportOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Delete sale states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<{ id: string; number: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // 1. Fetch paginated sales ledger
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sales', debouncedSearch, page],
    queryFn: async () => {
      const response = await api.get('/sales', {
        params: {
          search: debouncedSearch || undefined,
          page,
          limit,
        },
      });
      return response.data.data;
    },
  });

  // 2. Setup delete mutation
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setDeleteModalOpen(false);
      setSelectedSale(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.message || 'Failed to delete the sale transaction.');
    },
  });

  const handleDeleteClick = (id: string, dateStr: string, customerName: string) => {
    const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setSelectedSale({ id, number: `${customerName} - ${formattedDate}` });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSale) {
      performDelete(selectedSale.id);
    }
  };

  // Authenticated file export handler
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await api.get('/export/sales', {
        params: {
          format,
          search: debouncedSearch || undefined,
        },
        responseType: 'blob',
      });

      const contentType = String(response.headers['content-type'] || 'text/csv');
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let extension = 'csv';
      if (format === 'excel') extension = 'xlsx';
      if (format === 'pdf') extension = 'html';

      link.setAttribute('download', `sales_export_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // Helper: Format money
  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Sales Ledger</h2>
          <p className="text-sm text-zinc-500">
            Record and track your business sales transactions and billing items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Import Button */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-2 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-300 hover:text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all"
          >
            <UploadCloud className="h-4.5 w-4.5 text-zinc-400" />
            <span>Import</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-2 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-300 hover:text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 text-zinc-400" />
              <span>Export</span>
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-[#0c0c0f] border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-155">
                  <button
                    onClick={() => {
                      handleExport('csv');
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExport('excel');
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  >
                    Export Excel (XLSX)
                  </button>
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  >
                    Export PDF Report
                  </button>
                </div>
              </>
            )}
          </div>

          <Link
            to="/sales/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] justify-center"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="flex bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-4 items-center relative">
        <Search className="h-5 w-5 text-zinc-500 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search sales by customer name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#16161c] border border-zinc-800/60 focus:border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white transition-all placeholder:text-zinc-650"
        />
      </div>

      {/* 3. Main Data Container */}
      {isLoading ? (
        // Loading State: Skeleton list
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl divide-y divide-zinc-800/40 overflow-hidden shadow-xl">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 animate-pulse flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-20"></div>
              <div className="h-4 bg-zinc-800 rounded w-24"></div>
              <div className="h-8 bg-zinc-800 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        // Error State
        <div className="bg-[#0c0c0f] border border-zinc-800 p-12 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="mx-auto h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Failed to load sales journal</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            There was an error communicating with the sales ledger service. Please check your
            connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : !data || data.sales.length === 0 ? (
        // Empty State
        <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="mx-auto h-16 w-16 bg-zinc-800/40 border border-zinc-800/80 text-zinc-500 rounded-2xl flex items-center justify-center">
            <DollarSign className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">No sales found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              {debouncedSearch
                ? `No sales match the search phrase "${debouncedSearch}". Try searching for another customer.`
                : 'Your sales ledger is currently empty. Get started by recording your first customer sale.'}
            </p>
          </div>
          {!debouncedSearch && (
            <Link
              to="/sales/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Record Sale</span>
            </Link>
          )}
        </div>
      ) : (
        // Data Table
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/20 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Sale Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Billing Items</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-sm text-zinc-300">
                {data.sales.map((sale: any) => {
                  const itemsCount =
                    sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const firstItemName = sale.items?.[0]?.product?.name || '';
                  const itemSummaryText =
                    sale.items?.length > 1
                      ? `${firstItemName} and ${sale.items.length - 1} other item(s)`
                      : firstItemName || 'No items';

                  return (
                    <tr key={sale.id} className="hover:bg-zinc-800/10 transition-colors">
                      {/* Sale Date */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <span className="font-semibold text-white">
                            {formatDate(sale.saleDate)}
                          </span>
                        </div>
                      </td>
                      {/* Customer */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">{sale.customer?.name}</div>
                            {sale.customer?.company && (
                              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">
                                {sale.customer.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Items details */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <ShoppingBag className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <div>
                            <span className="text-zinc-350">{itemSummaryText}</span>
                            <span className="text-[10px] text-zinc-500 ml-1.5">
                              ({itemsCount} unit(s))
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Total Amount */}
                      <td className="p-4 text-right font-bold text-white text-base">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      {/* Actions */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/sales/${sale.id}/edit`}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-all"
                            title="Edit Transaction"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteClick(sale.id, sale.saleDate, sale.customer?.name)
                            }
                            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Pagination Footer */}
          <div className="p-4 bg-zinc-950/10 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Showing <span className="font-semibold text-zinc-300">{data.sales.length}</span> of{' '}
              <span className="font-semibold text-zinc-300">{data.total}</span> transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-800/50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-zinc-300">
                Page {page} of {data.totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-800/50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteSaleConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedSale(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        saleNumber={selectedSale?.number || ''}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        resource="sales"
        title="Import Sales Ledger Records"
      />
    </div>
  );
};
