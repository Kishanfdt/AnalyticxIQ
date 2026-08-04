import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema, CreateCustomerInput } from '@analyticiq/shared';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomerFormProps {
  initialData?: Partial<CreateCustomerInput>;
  onSubmit: (data: CreateCustomerInput) => void;
  isLoading: boolean;
  title: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  title,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  const handleFormSubmit = (data: CreateCustomerInput) => {
    // Sanitize values: map empty strings to null
    const sanitized: CreateCustomerInput = {
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      company: data.company?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
    };
    onSubmit(sanitized);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/customers"
          className="h-10 w-10 border border-zinc-800/80 bg-[#0c0c0f] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-sm text-zinc-500">Provide the customer profile details below</p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register('name')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="text"
              placeholder="e.g. john@example.com"
              {...register('email')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. +1 (555) 000-0000"
              {...register('phone')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              {...register('company')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.company && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.company.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. 123 Business Rd, Suite 100"
              {...register('address')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Notes / Remarks
            </label>
            <textarea
              rows={4}
              placeholder="Enter customer relationship details, preferences, or transaction history details..."
              {...register('notes')}
              className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600 resize-none"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/40">
          <Link
            to="/customers"
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
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
