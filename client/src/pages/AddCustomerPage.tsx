import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';
import { CustomerForm } from '../components';
import { CreateCustomerInput } from '@analyticiq/shared';
import { AlertCircle } from 'lucide-react';

export const AddCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newCustomer: CreateCustomerInput) => {
      const response = await api.post('/customers', newCustomer);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 'Failed to create customer. Please check validation rules.',
      );
    },
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="max-w-2xl flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <CustomerForm title="Add New Customer" onSubmit={mutate} isLoading={isPending} />
    </div>
  );
};
