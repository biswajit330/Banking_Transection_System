import React from 'react';
import { X, ShieldCheck, Clock, KeyRound, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

export function TransactionDetailsModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">Transaction Record</h2>
              <p className="text-[11px] text-slate-500 mono truncate">ID: {transaction._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Amount Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <p className="text-xs text-slate-500">Total Transferred Amount (INR)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mono break-words">
            {formatCurrency(transaction.amount)}
          </p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {transaction.status}
          </span>
        </div>

        {/* Details Key-Value List */}
        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 gap-1">
            <span className="text-slate-500 flex items-center space-x-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Debited Account (From)</span>
            </span>
            <span className="text-slate-800 mono font-semibold break-all sm:text-right">
              {transaction.fromAccount?._id || transaction.fromAccount}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 gap-1">
            <span className="text-slate-500 flex items-center space-x-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Credited Account (To)</span>
            </span>
            <span className="text-slate-800 mono font-semibold break-all sm:text-right">
              {transaction.toAccount?._id || transaction.toAccount}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 gap-1">
            <span className="text-slate-500 flex items-center space-x-1.5 shrink-0">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Idempotency Key</span>
            </span>
            <span className="text-slate-800 mono text-[11px] break-all sm:text-right">
              {transaction.idempotencyKey}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
            <span className="text-slate-500 flex items-center space-x-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Execution Timestamp</span>
            </span>
            <span className="text-slate-700 sm:text-right">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
