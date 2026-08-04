import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services';
import { CustomerForm } from '../components';
import { CreateCustomerInput } from '@analyticiq/shared';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch existing customer details
  const {
    data: customer,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // 2. Setup update mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (updatedCustomer: CreateCustomerInput) => {
      const response = await api.put(`/customers/${id}`, updatedCustomer);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/customers');
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 'Failed to update customer. Please check validation rules.',
      );
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-sm font-medium">Loading customer profile...</span>
      </div>
    );
  }

  // Error state for fetching customer
  if (isError) {
    return (
      <div className="max-w-2xl bg-[#0c0c0f] border border-zinc-800 p-8 rounded-2xl text-center space-y-4">
        <div className="mx-auto h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Failed to load customer</h3>
        <p className="text-sm text-zinc-400">
          {(fetchError as any)?.response?.data?.message ||
            'The customer profile could not be found or you do not have permission to access it.'}
        </p>
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  // Map customer object details to default form values (handle nulls as empty strings)
  const initialFormValues: Partial<CreateCustomerInput> = {
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    company: customer.company || '',
    address: customer.address || '',
    notes: customer.notes || '',
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="max-w-2xl flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <CustomerForm
        title="Edit Customer Profile"
        initialData={initialFormValues}
        onSubmit={mutate}
        isLoading={isPending}
      />
    </div>
  );
};
