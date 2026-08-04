import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterInput } from '@analyticiq/shared';
import { useAuth } from '../features';
import { AlertCircle, Lock, Mail, User, Briefcase, Loader2, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await registerAuth(data);
      navigate('/products');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please verify details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AnalyticxIQ
          </span>
        </div>

        {/* Card wrapper */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Glow effects */}
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Create an account</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Register your business and start managing inventory
          </p>

          {error && (
            <div className="mb-5 flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Business Name
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Acme Corp"
                  {...register('businessName')}
                  className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
                />
              </div>
              {errors.businessName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="john@company.com"
                  {...register('email')}
                  className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-[#16161c] border border-zinc-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-white transition-all placeholder:text-zinc-600"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-medium leading-relaxed">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
