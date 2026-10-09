import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountsApi, transactionsApi } from '../services/api';
import { formatCurrency, formatDate, truncateId, generateIdempotencyKey } from '../utils/helpers';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  RefreshCw,
  Coins,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Clock
} from 'lucide-react';

export function Dashboard({ onNavigate, onSelectAccount, onSelectTransaction, onShowToast }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setSyncing(true);
    else setLoading(true);

    try {
      const [accRes, txRes] = await Promise.all([
        accountsApi.getAccounts(),
        transactionsApi.getTransactions()
      ]);

      setAccounts(accRes.accounts || []);
      setTransactions(txRes.transactions || []);
      if (isManual) onShowToast?.('Dashboard synchronized with live banking ledger', 'success');
    } catch (err) {
      onShowToast?.(err.message || 'Failed to retrieve banking data', 'error');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const handleQuickFund = async (accountId) => {
    try {
      const amount = 5000;
      await transactionsApi.fundFromTreasury({
        toAccount: accountId,
        amount,
        idempotencyKey: generateIdempotencyKey()
      });
      onShowToast?.(`Deposited ₹${amount.toLocaleString('en-IN')} from Treasury directly into account!`, 'success');
      fetchDashboardData(true);
    } catch (err) {
      onShowToast?.(err.message || 'Treasury deposit failed', 'error');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome & Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Real-time balance derivation & double-entry transactions.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={syncing}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('transfer')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Summary of Account Balances (Card-based layout) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Account Balances Summary</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('accounts')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Manage Accounts →
          </button>
        </div>

        {/* Aggregate Balance & Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Main Total Balance Hero Card */}
          <div className="md:col-span-1 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-emerald-700 text-[11px]">
                Total Liquid Assets
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mono break-words">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated across {accounts.length} active financial account{accounts.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ACID Guaranteed</span>
              </span>
              <span className="mono font-semibold text-emerald-700">INR Standard (₹)</span>
            </div>
          </div>

          {/* Individual Account Balance Cards Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              <>
                <div className="h-36 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                <div className="h-36 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              </>
            ) : accounts.length === 0 ? (
              <div className="col-span-full p-6 sm:p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500">No banking accounts established yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('accounts')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  + Open Primary Account
                </button>
              </div>
            ) : (
              accounts.map((acc, index) => (
                <div
                  key={acc._id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-3 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          Account #{index + 1}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {acc.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mono truncate">
                      ID: {truncateId(acc._id, 14)}
                    </p>

                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mono mt-1.5 break-words">
                      {formatCurrency(acc.balance, acc.currency)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectAccount?.(acc)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ledger</span>
                      <span>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFund(acc._id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-emerald-800 transition cursor-pointer"
                    >
                      + Fund (₹5,000)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: List of Recent Financial Transactions (Clean Card-Based Layout) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Recent Financial Transactions</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('transactions')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            View Full Journal ({transactions.length}) →
          </button>
        </div>

        {/* Transaction Cards List */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-20 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
            <div className="h-20 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">No financial transactions recorded yet.</p>
            <button
              type="button"
              onClick={() => onNavigate?.('transfer')}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition cursor-pointer"
            >
              Initiate First Transfer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5">
            {transactions.slice(0, 6).map((tx) => {
              const isOutbound = accounts.some(
                (a) => a._id === (tx.fromAccount?._id || tx.fromAccount)
              );
              const isInbound = accounts.some(
                (a) => a._id === (tx.toAccount?._id || tx.toAccount)
              );
              const isDebit = isOutbound && !isInbound;

              return (
                <div
                  key={tx._id}
                  onClick={() => onSelectTransaction?.(tx)}
                  className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isDebit
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 tracking-tight">
                            {isDebit ? 'Outbound Transfer' : 'Inbound Credit'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mono mt-0.5">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm sm:text-base font-extrabold mono ${
                          isDebit ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[10px] text-slate-400 mono">
                        {tx.fromAccount?.currency || 'INR'}
                      </p>
                    </div>
                  </div>

                  {/* Account route & Idempotency Key chips */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center space-x-1 mono text-[10px] sm:text-[11px] min-w-0 flex-wrap">
                      <span className="text-slate-400">From:</span>
                      <span className="text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                        {truncateId(tx.fromAccount?._id || tx.fromAccount, 6)}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-400">To:</span>
                      <span className="text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                        {truncateId(tx.toAccount?._id || tx.toAccount, 6)}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 mono group-hover:text-emerald-700 transition-colors">
                      Details ↗
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
