import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createSaleSchema, CreateSaleInput } from '@analyticiq/shared';
import { api } from '../services';
import { Loader2, ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SaleFormProps {
  initialData?: Partial<CreateSaleInput>;
  onSubmit: (data: CreateSaleInput) => void;
  isLoading: boolean;
  title: string;
}

export const SaleForm: React.FC<SaleFormProps> = ({ initialData, onSubmit, isLoading, title }) => {
  // 1. Fetch Customers and Products for selectors (retrieve up to 100 items for dropdown listings)
  const {
    data: customersResponse,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
  } = useQuery({
    queryKey: ['customers-selector-list'],
    queryFn: async () => {
      const response = await api.get('/customers', {
        params: { limit: 100, page: 1 },
      });
      return response.data.data.customers;
    },
  });

  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery({
    queryKey: ['products-selector-list'],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { limit: 100, page: 1 },
      });
      return response.data.data.products;
    },
  });

  const customers = customersResponse || [];
  const products = productsResponse || [];

  // Create lookup maps for fast calculations
  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

  // 2. Setup React Hook Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSaleInput>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      saleDate: initialData?.saleDate
        ? (new Date(initialData.saleDate).toISOString().split('T')[0] as any)
        : (new Date().toISOString().split('T')[0] as any),
      items: initialData?.items || [{ productId: '', quantity: 1, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch items array to calculate real-time running totals on the client
  const watchedItems = useWatch({
    control,
    name: 'items',
  });

  // Calculate totals
  let runningTotal = 0;
  const itemSubtotals = (watchedItems || []).map((item) => {
    if (!item || !item.productId) return 0;
    const product = productMap.get(item.productId);
    if (!product) return 0;

    const basePrice = Number(product.price);
    const qty = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;

    const unitPrice = basePrice * (1 - discount / 100);
    const subtotal = qty * unitPrice;
    runningTotal += subtotal;
    return subtotal;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const handleFormSubmit = (data: CreateSaleInput) => {
    // Sanitize dates and input numeric values
    const sanitized: CreateSaleInput = {
      customerId: data.customerId,
      saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, Number(item.quantity)),
        discount: Math.min(100, Math.max(0, Number(item.discount) || 0)),
      })),
    };
    onSubmit(sanitized);
  };

  if (isLoadingCustomers || isLoadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-sm font-medium">Resolving customer and product catalogs...</span>
      </div>
    );
  }

  if (isErrorCustomers || isErrorProducts) {
    return (
      <div className="max-w-2xl bg-[#0c0c0f] border border-zinc-800 p-8 rounded-2xl text-center space-y-4">
        <div className="mx-auto h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Catalog Retrieval Failed</h3>
        <p className="text-sm text-zinc-400">
          We encountered an issue fetching your customers or products list. Please ensure you have
          created at least one customer and one product first.
        </p>
        <Link
          to="/sales"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sales</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/sales"
          className="h-10 w-10 border border-zinc-800/80 bg-[#0c0c0f] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-sm text-zinc-500">Record a new transaction in your sales journal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Customer Selection */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('customerId')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all appearance-none"
            >
              <option value="">-- Choose a Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.customerId.message}</p>
            )}
          </div>

          {/* Sale Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Sale Date
            </label>
            <input
              type="date"
              {...register('saleDate')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all"
            />
            {errors.saleDate && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.saleDate.message}</p>
            )}
          </div>
        </div>

        {/* Dynamic Items Panel */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Sale Line Items
            </h3>
            {errors.items?.message && (
              <span className="text-xs text-rose-500 font-medium">{errors.items.message}</span>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const watchedProductId = watchedItems?.[index]?.productId;
              const product = watchedProductId ? productMap.get(watchedProductId) : null;
              const basePrice = product ? Number(product.price) : 0;
              const discount = watchedItems?.[index]?.discount || 0;
              const currentSubtotal = itemSubtotals[index] || 0;

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-[#16161c]/40 border border-zinc-800/40 p-3.5 rounded-xl"
                >
                  {/* Product Dropdown */}
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 sm:hidden">
                      Product
                    </label>
                    <select
                      {...register(`items.${index}.productId` as const)}
                      className="w-full bg-[#16161c] border border-zinc-800/80 focus:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none text-white transition-all"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {formatCurrency(Number(p.price))}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Control */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 sm:hidden">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      {...register(`items.${index}.quantity` as const)}
                      className="w-full bg-[#16161c] border border-zinc-800/80 focus:border-zinc-700 rounded-lg px-3 py-2 text-sm text-center focus:outline-none text-white transition-all"
                    />
                  </div>

                  {/* Discount Control */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 sm:hidden">
                      Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        {...register(`items.${index}.discount` as const)}
                        className="w-full bg-[#16161c] border border-zinc-800/80 focus:border-zinc-700 rounded-lg pl-3 pr-7 py-2 text-sm text-center focus:outline-none text-white transition-all"
                      />
                      <span className="absolute right-2.5 top-2 text-zinc-500 text-xs font-semibold">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Unit Price (Display Only) */}
                  <div className="sm:col-span-2 text-right py-2 text-xs font-medium text-zinc-400">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block sm:hidden">
                      Unit Price
                    </div>
                    <span>{formatCurrency(basePrice * (1 - discount / 100))}</span>
                  </div>

                  {/* Subtotal */}
                  <div className="sm:col-span-1.5 text-right py-2 text-sm font-semibold text-white">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block sm:hidden">
                      Subtotal
                    </div>
                    <span>{formatCurrency(currentSubtotal)}</span>
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-0.5 text-right sm:text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                      title="Remove Row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Row Button & Running Total Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={() => append({ productId: '', quantity: 1, discount: 0 })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-all self-start"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line Item</span>
            </button>

            <div className="bg-[#16161c]/60 border border-zinc-800/60 rounded-xl p-4 flex gap-8 items-center justify-between min-w-[240px]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Running Total
              </span>
              <span className="text-xl font-bold text-white">{formatCurrency(runningTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <Link
            to="/sales"
            className="px-5 py-3 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Transaction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
