import React from 'react';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface DeleteSaleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saleNumber: string;
  isLoading: boolean;
  error: string | null;
}

export const DeleteSaleConfirmModal: React.FC<DeleteSaleConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  saleNumber,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#0c0c0f] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex gap-4 items-start mb-6">
          <div className="h-10 w-10 shrink-0 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Sale Transaction</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to delete sale transaction{' '}
              <span className="font-semibold text-white">"{saleNumber}"</span>? This action cannot
              be undone and will permanently remove this transaction and its line items from your
              ledger.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex gap-2 items-start bg-rose-950/20 border border-rose-800/30 text-rose-400 p-4 rounded-xl text-xs font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/40">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-400 hover:text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Sale</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
