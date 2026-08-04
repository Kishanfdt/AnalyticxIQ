import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, CreateProductInput } from '@analyticiq/shared';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductFormProps {
  initialData?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => void;
  isLoading: boolean;
  title: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  title,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      price: initialData?.price !== undefined ? initialData.price : 0,
      costPrice: initialData?.costPrice !== undefined ? initialData.costPrice : null,
      stock: initialData?.stock !== undefined ? initialData.stock : 0,
      categoryName: initialData?.categoryName || '',
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = (data: CreateProductInput) => {
    // Sanitize values: map empty inputs to null
    const sanitized: CreateProductInput = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      costPrice:
        (data.costPrice as any) === '' ||
        data.costPrice === null ||
        data.costPrice === undefined ||
        isNaN(Number(data.costPrice))
          ? null
          : Number(data.costPrice),
      categoryName: data.categoryName?.trim() || null,
      description: data.description?.trim() || null,
    };
    onSubmit(sanitized);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="h-10 w-10 border border-zinc-800/80 bg-[#0c0c0f] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-sm text-zinc-500">Provide the product profile details below</p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wireless Mouse"
              {...register('name')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MOUSE-WRLS-01"
              {...register('sku')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.sku.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Electronics"
              {...register('categoryName')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.categoryName && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.categoryName.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Selling Price ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('price')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.price.message}</p>
            )}
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Cost Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('costPrice')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.costPrice && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.costPrice.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Stock Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="0"
              {...register('stock')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.stock.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Enter product details or specs..."
              {...register('description')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/40">
          <Link
            to="/products"
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
