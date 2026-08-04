import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services';
import { DeleteConfirmModal, ImportModal } from '../components';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10; // Items per page

  // Data Ops States
  const [exportOpen, setExportOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Delete product states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // 1. Fetch paginated products list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', debouncedSearch, page],
    queryFn: async () => {
      const response = await api.get('/products', {
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
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteModalOpen(false);
      setSelectedProduct(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.message || 'Failed to delete the product.');
    },
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedProduct({ id, name });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      performDelete(selectedProduct.id);
    }
  };

  // Authenticated file export handler
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await api.get('/export/products', {
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

      link.setAttribute('download', `products_export_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // Helper: format money
  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  // Helper: calculate margin
  const calculateMargin = (priceStr: string, costPriceStr: string | null) => {
    const price = Number(priceStr);
    if (!costPriceStr || isNaN(Number(costPriceStr)) || price <= 0) return null;
    const cost = Number(costPriceStr);
    const margin = ((price - cost) / price) * 100;
    return margin.toFixed(1);
  };

  // Helper: stock status color badge
  const getStockBadgeClass = (stock: number) => {
    if (stock <= 5) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (stock <= 20) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Product Catalog</h2>
          <p className="text-sm text-zinc-500">
            Manage and track your business's product portfolio
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
            to="/products/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] justify-center"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Controls */}
      <div className="flex bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-4 items-center relative">
        <Search className="h-5 w-5 text-zinc-500 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
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
              <div className="h-4 bg-zinc-800 rounded w-16"></div>
              <div className="h-4 bg-zinc-800 rounded w-20"></div>
              <div className="h-8 bg-zinc-800 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        // Error State
        <div className="bg-[#0c0c0f] border border-zinc-800 p-12 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="mx-auto h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Failed to load catalog</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            There was an error communicating with the inventory service. Please check your network
            and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : !data || data.products.length === 0 ? (
        // Empty State
        <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="mx-auto h-16 w-16 bg-zinc-800/40 border border-zinc-800/80 text-zinc-500 rounded-2xl flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              {debouncedSearch
                ? `No products match the search phrase "${debouncedSearch}". Try a different keyword.`
                : 'Your inventory catalog is currently empty. Get started by adding your first product.'}
            </p>
          </div>
          {!debouncedSearch && (
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Product</span>
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
                  <th className="p-4 pl-6">Product Details</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Cost Price</th>
                  <th className="p-4 text-center">Margin</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-sm text-zinc-300">
                {data.products.map((prod: any) => {
                  const margin = calculateMargin(prod.price, prod.costPrice);
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/10 transition-colors">
                      {/* Name & Category */}
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-white">{prod.name}</div>
                        {prod.category?.name ? (
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {prod.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-650 font-normal italic">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      {/* SKU */}
                      <td className="p-4 font-mono text-xs">{prod.sku}</td>
                      {/* Price */}
                      <td className="p-4 text-right font-semibold text-white">
                        {formatCurrency(prod.price)}
                      </td>
                      {/* Cost Price */}
                      <td className="p-4 text-right font-medium text-zinc-400">
                        {formatCurrency(prod.costPrice)}
                      </td>
                      {/* Profit Margin */}
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          {margin ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{margin}%</span>
                            </span>
                          ) : (
                            <span className="text-zinc-650 text-xs italic">-</span>
                          )}
                        </div>
                      </td>
                      {/* Stock Badge */}
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-block border px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${getStockBadgeClass(prod.stock)}`}
                          >
                            {prod.stock} units
                          </span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${prod.id}/edit`}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-all"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(prod.id, prod.name)}
                            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-all"
                            title="Delete Product"
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
              Showing <span className="font-semibold text-zinc-300">{data.products.length}</span> of{' '}
              <span className="font-semibold text-zinc-300">{data.total}</span> products
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
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.name || ''}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        resource="products"
        title="Import Products Catalog"
      />
    </div>
  );
};
