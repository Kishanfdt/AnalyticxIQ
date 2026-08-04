import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services';
import { DeleteCustomerConfirmModal } from '../components';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

export const CustomerListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10; // Items per page

  // Delete customer states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // 1. Fetch paginated customers list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', debouncedSearch, page],
    queryFn: async () => {
      const response = await api.get('/customers', {
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
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteModalOpen(false);
      setSelectedCustomer(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.message || 'Failed to delete the customer.');
    },
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedCustomer({ id, name });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      performDelete(selectedCustomer.id);
    }
  };

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Customer Directory</h2>
          <p className="text-sm text-zinc-500">
            Manage, search, and edit profiles for your business customers
          </p>
        </div>
        <Link
          to="/customers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] shrink-0 justify-center"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Customer</span>
        </Link>
      </div>

      {/* 2. Search Box */}
      <div className="flex bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-4 items-center relative">
        <Search className="h-5 w-5 text-zinc-500 absolute left-8 pointer-events-none" />
        <input
          type="text"
          placeholder="Search customers by name, email, phone or company..."
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
              <div className="h-4 bg-zinc-800 rounded w-28"></div>
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
          <h3 className="text-lg font-bold text-white">Failed to load directory</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            There was an error communicating with the customer service. Please check your network
            connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : !data || data.customers.length === 0 ? (
        // Empty State
        <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="mx-auto h-16 w-16 bg-zinc-800/40 border border-zinc-800/80 text-zinc-500 rounded-2xl flex items-center justify-center">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">No customers found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              {debouncedSearch
                ? `No customers match the search phrase "${debouncedSearch}". Try a different keyword.`
                : 'Your customer directory is currently empty. Get started by adding your first customer profile.'}
            </p>
          </div>
          {!debouncedSearch && (
            <Link
              to="/customers/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Customer</span>
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
                  <th className="p-4 pl-6">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-sm text-zinc-300">
                {data.customers.map((cust: any) => (
                  <tr key={cust.id} className="hover:bg-zinc-800/10 transition-colors">
                    {/* Name Card */}
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-white">{cust.name}</div>
                      {cust.notes ? (
                        <p
                          className="text-xs text-zinc-500 truncate max-w-xs mt-1"
                          title={cust.notes}
                        >
                          {cust.notes}
                        </p>
                      ) : (
                        <span className="text-[10px] text-zinc-650 font-normal italic">
                          No notes
                        </span>
                      )}
                    </td>
                    {/* Contact Info */}
                    <td className="p-4 space-y-1">
                      {cust.email ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Mail className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.email}</span>
                        </div>
                      ) : null}
                      {cust.phone ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Phone className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                      ) : null}
                      {!cust.email && !cust.phone ? (
                        <span className="text-xs text-zinc-650 italic">No contact info</span>
                      ) : null}
                    </td>
                    {/* Company */}
                    <td className="p-4">
                      {cust.company ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span>{cust.company}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-650 text-xs italic">Independent</span>
                      )}
                    </td>
                    {/* Address */}
                    <td className="p-4">
                      {cust.address ? (
                        <div
                          className="flex items-center gap-1.5 text-xs text-zinc-400 max-w-[200px]"
                          title={cust.address}
                        >
                          <MapPin className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-650 text-xs italic">No address</span>
                      )}
                    </td>
                    {/* Created At */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                        <span>{formatDate(cust.createdAt)}</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/customers/${cust.id}/edit`}
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-all"
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(cust.id, cust.name)}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Pagination Footer */}
          <div className="p-4 bg-zinc-950/10 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Showing <span className="font-semibold text-zinc-300">{data.customers.length}</span>{' '}
              of <span className="font-semibold text-zinc-300">{data.total}</span> customers
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
      <DeleteCustomerConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCustomer(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        customerName={selectedCustomer?.name || ''}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};
