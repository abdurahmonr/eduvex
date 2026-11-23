import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'O\'chirish', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-md shrink-0 border border-rose-200/60">
          <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md transition-colors cursor-pointer border border-stone-200"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'O\'chirilmoqda...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
