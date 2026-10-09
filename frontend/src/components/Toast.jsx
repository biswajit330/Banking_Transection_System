import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border text-sm sm:max-w-md transition-all duration-200 ${
        isError
          ? 'bg-rose-50 text-rose-900 border-rose-200'
          : isSuccess
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : 'bg-white text-slate-800 border-slate-200'
      }`}
    >
      <div className="shrink-0">
        {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {!isError && !isSuccess && <Info className="w-5 h-5 text-teal-600" />}
      </div>
      <div className="flex-1 text-xs font-medium leading-relaxed break-words">
        {toast.message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-600 p-1 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
