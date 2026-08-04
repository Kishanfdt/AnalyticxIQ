import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';
import { SaleForm } from '../components';
import { CreateSaleInput } from '@analyticiq/shared';
import { AlertCircle } from 'lucide-react';

export const CreateSalePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newSale: CreateSaleInput) => {
      const response = await api.post('/sales', newSale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      // Invalidate selectors to update quantities / items if needed
      queryClient.invalidateQueries({ queryKey: ['products-selector-list'] });
      navigate('/sales');
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          'Failed to create sale transaction. Please check validation rules.',
      );
    },
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="max-w-4xl flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <SaleForm title="Record New Sale" onSubmit={mutate} isLoading={isPending} />
    </div>
  );
};
