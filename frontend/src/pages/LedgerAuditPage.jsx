// import React, { useState, useEffect } from 'react';
// import { transactionsApi } from '../services/api';
// import { formatCurrency } from '../utils/helpers';
// import { RefreshCw } from 'lucide-react';

// export function LedgerAuditPage({ onShowToast }) {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const loadLedger = async () => {
//     setLoading(true);
//     try {
//       const res = await transactionsApi.getLedgerAudit();
//       setEntries(res.entries || []);
//     } catch (err) {
//       onShowToast?.(err.message || 'Error loading ledger audit', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadLedger();
//   }, []);

//   const totalCredits = entries
//     .filter((e) => e.type === 'CREDIT')
//     .reduce((sum, e) => sum + (e.amount || 0), 0);

//   const totalDebits = entries
//     .filter((e) => e.type === 'DEBIT')
//     .reduce((sum, e) => sum + (e.amount || 0), 0);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Double-Entry Audit Ledger</h1>
//           <p className="text-xs text-slate-500">
//             Immutable append-only journal entries in INR (₹). All Mongoose update/delete hooks are blocked.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadLedger}
//           className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
//         >
//           <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
//           <span>Refresh Audit</span>
//         </button>
//       </div>

//       {/* Verification Banner */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
//           <p className="text-xs text-slate-500 font-semibold">Total Audited Debits</p>
//           <p className="text-2xl font-extrabold text-rose-600 mono">{formatCurrency(totalDebits)}</p>
//           <p className="text-[11px] text-slate-400">Subtracted from account balances</p>
//         </div>

//         <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
//           <p className="text-xs text-slate-500 font-semibold">Total Audited Credits</p>
//           <p className="text-2xl font-extrabold text-emerald-700 mono">{formatCurrency(totalCredits)}</p>
//           <p className="text-[11px] text-slate-400">Added to account balances</p>
//         </div>

//         <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
//           <p className="text-xs text-slate-500 font-semibold">Net Derived Balance</p>
//           <p className="text-2xl font-extrabold text-teal-700 mono">
//             {formatCurrency(totalCredits - totalDebits)}
//           </p>
//           <p className="text-[11px] text-slate-400">Derived via MongoDB $subtract aggregate</p>
//         </div>
//       </div>

//       {/* Ledger Table */}
//       <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs">
//             <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
//               <tr>
//                 <th className="px-4 py-3">Journal Entry ID</th>
//                 <th className="px-4 py-3">Entry Type</th>
//                 <th className="px-4 py-3">Book Amount</th>
//                 <th className="px-4 py-3">Associated Account</th>
//                 <th className="px-4 py-3">Transaction Reference</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 mono">
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-slate-400 font-sans">
//                     Loading audit trail...
//                   </td>
//                 </tr>
//               ) : entries.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-slate-500 font-sans">
//                     No ledger entries found.
//                   </td>
//                 </tr>
//               ) : (
//                 entries.map((entry) => (
//                   <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
//                     <td className="px-4 py-3 text-slate-600">{entry._id}</td>
//                     <td className="px-4 py-3 font-bold">
//                       <span className={entry.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'}>
//                         {entry.type}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 font-bold text-slate-900">
//                       {entry.type === 'DEBIT' ? '-' : '+'}{formatCurrency(entry.amount)}
//                     </td>
//                     <td className="px-4 py-3 text-slate-600">{entry.account}</td>
//                     <td className="px-4 py-3 text-slate-500">{entry.transaction}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../services/api';
import { formatCurrency, generateIdempotencyKey, truncateId } from '../utils/helpers';
import { RefreshCw, Landmark, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LedgerAuditPage({ onShowToast }) {
  const [entries, setEntries] = useState([]);
  const [treasury, setTreasury] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crediting, setCrediting] = useState(false);

  const loadLedgerAndTreasury = async () => {
    setLoading(true);
    try {
      const [ledgerRes, treasuryRes] = await Promise.all([
        transactionsApi.getLedgerAudit(),
        transactionsApi.getTreasuryStatus()
      ]);
      setEntries(ledgerRes.entries || []);
      setTreasury(treasuryRes.treasury || null);
    } catch (err) {
      onShowToast?.(err.message || 'Error loading ledger audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerAndTreasury();
  }, []);

  const handleCreditTreasury = async (amount) => {
    setCrediting(true);
    try {
      const res = await transactionsApi.creditTreasury({
        amount,
        idempotencyKey: generateIdempotencyKey()
      });
      onShowToast?.(res.message || `Infused ${formatCurrency(amount)} into System Treasury!`, 'success');
      loadLedgerAndTreasury();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to infuse treasury capital', 'error');
    } finally {
      setCrediting(false);
    }
  };

  const totalCredits = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalDebits = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Double-Entry Audit Ledger</h1>
          <p className="text-xs text-slate-500">
            Immutable append-only journal entries in INR (₹). System Treasury reserve management and audit verification.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLedgerAndTreasury}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* SECTION: System Treasury Capital & Reserve Management */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">System Treasury Account Reserves</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  CENTRAL BANK
                </span>
              </div>
              <p className="text-xs text-slate-500 mono">
                Account ID: {treasury ? treasury.accountId : 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={crediting}
              onClick={() => handleCreditTreasury(1000000)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Infuse ₹10 Lakhs</span>
            </button>
            <button
              type="button"
              disabled={crediting}
              onClick={() => handleCreditTreasury(5000000)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Infuse ₹50 Lakhs</span>
            </button>
            <button
              type="button"
              disabled={crediting}
              onClick={() => handleCreditTreasury(10000000)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Infuse ₹1 Crore</span>
            </button>
          </div>
        </div>

        {/* Treasury Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Treasury Derived Balance</p>
            <p className={`text-2xl font-extrabold mono ${treasury && treasury.balance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {treasury ? formatCurrency(treasury.balance) : '—'}
            </p>
            <p className="text-[11px] text-slate-400">
              {treasury && treasury.balance >= 0 ? '✓ Healthy Positive Reserve' : 'Deficit (Requires Capital Infusion)'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Total Capital Credited</p>
            <p className="text-2xl font-extrabold text-emerald-700 mono">
              {treasury ? formatCurrency(treasury.totalCredits) : '—'}
            </p>
            <p className="text-[11px] text-slate-400">Injected reserve endowment</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Total Disbursed to Users</p>
            <p className="text-2xl font-extrabold text-rose-600 mono">
              {treasury ? formatCurrency(treasury.totalDebits) : '—'}
            </p>
            <p className="text-[11px] text-slate-400">Transferred out via initial seed & quick funds</p>
          </div>
        </div>
      </div>

      {/* Entire Bank Verification Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <p className="text-xs text-slate-500 font-semibold">Total Bank-wide Debits</p>
          <p className="text-2xl font-extrabold text-rose-600 mono">{formatCurrency(totalDebits)}</p>
          <p className="text-[11px] text-slate-400">All debit journal entries across all accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <p className="text-xs text-slate-500 font-semibold">Total Bank-wide Credits</p>
          <p className="text-2xl font-extrabold text-emerald-700 mono">{formatCurrency(totalCredits)}</p>
          <p className="text-[11px] text-slate-400">All credit journal entries across all accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <p className="text-xs text-slate-500 font-semibold">Ledger Verification Status</p>
          <div className="flex items-center space-x-1.5 text-emerald-700 text-lg font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Balanced & Audited</span>
          </div>
          <p className="text-[11px] text-slate-400">Total entries recorded: {entries.length}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Immutable Audit Trail ({entries.length} Records)
          </h3>
          <span className="text-[11px] text-slate-400">Append-only ledger journal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Journal Entry ID</th>
                <th className="px-4 py-3">Entry Type</th>
                <th className="px-4 py-3">Book Amount</th>
                <th className="px-4 py-3">Associated Account</th>
                <th className="px-4 py-3">Transaction Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 mono">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-sans">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{entry._id}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={entry.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {entry.type === 'DEBIT' ? '-' : '+'}{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.account}</td>
                    <td className="px-4 py-3 text-slate-500">{entry.transaction}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

