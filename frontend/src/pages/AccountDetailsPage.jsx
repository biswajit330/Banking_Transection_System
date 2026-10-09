import React, { useState, useEffect } from 'react';
import { accountsApi, transactionsApi } from '../services/api';
import { formatCurrency, formatDate, truncateId, generateIdempotencyKey } from '../utils/helpers';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export function AccountDetailsPage({ account, onBack, onNavigate, onShowToast }) {
  const [currentAccount, setCurrentAccount] = useState(account);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [balanceRes, ledgerRes] = await Promise.all([
        accountsApi.getAccountBalance(account._id),
        transactionsApi.getLedgerAudit()
      ]);

      setCurrentAccount(prev => ({
        ...prev,
        balance: balanceRes.balance,
        status: balanceRes.statusType || prev.status
      }));

      // Filter ledger entries for this account
      const filtered = (ledgerRes.entries || []).filter(
        entry => entry.account === account._id
      );
      setLedgerEntries(filtered);
    } catch (err) {
      onShowToast?.(err.message || 'Error loading account details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account?._id) {
      loadDetails();
    }
  }, [account]);

  const handleQuickFund = async () => {
    try {
      const amount = 5000;
      await transactionsApi.fundFromTreasury({
        toAccount: account._id,
        amount,
        idempotencyKey: generateIdempotencyKey()
      });
      onShowToast?.(`Funded ₹${amount.toLocaleString('en-IN')} into this account!`, 'success');
      loadDetails();
    } catch (err) {
      onShowToast?.(err.message || 'Funding error', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          type="button"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Details</h1>
          <p className="text-xs text-slate-500 mono">ID: {account?._id}</p>
        </div>
      </div>

      {/* Account Balance Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentAccount?.status}
              </span>
              <span className="text-xs text-slate-500 mono font-semibold">{currentAccount?.currency} Currency</span>
            </div>
            <p className="text-xs text-slate-500">Current Aggregated Ledger Balance</p>
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight mono">
              {formatCurrency(currentAccount?.balance, currentAccount?.currency)}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleQuickFund}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-emerald-800 transition cursor-pointer"
            >
              + Treasury Injection (₹5,000)
            </button>
            <button
              onClick={() => onNavigate('transfer')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Send Transfer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <p className="text-slate-400 text-[11px]">Associated User</p>
            <p className="font-semibold text-slate-800 mono mt-0.5">{truncateId(currentAccount?.user, 12)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Audit Ledger Entries</p>
            <p className="font-semibold text-slate-800 mono mt-0.5">{ledgerEntries.length} records</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Account Created</p>
            <p className="font-semibold text-slate-800 mt-0.5">{formatDate(currentAccount?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Account's Immutable Ledger Audit Trail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Ledger Journal Entries</h2>
            <p className="text-xs text-slate-500">Direct debit and credit book entries for this account in INR</p>
          </div>
          <button
            onClick={loadDetails}
            type="button"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Entry ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 mono">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 font-sans">
                      Loading ledger entries...
                    </td>
                  </tr>
                ) : ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 font-sans">
                      No ledger journal entries recorded for this account yet.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{entry._id}</td>
                      <td className="px-4 py-3 font-bold">
                        <span className={entry.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {entry.type === 'DEBIT' ? '-' : '+'}{formatCurrency(entry.amount, currentAccount?.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{entry.transaction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
