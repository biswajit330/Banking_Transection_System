import React, { useState, useEffect } from 'react';
import { accountsApi, transactionsApi } from '../services/api';
import { formatCurrency, formatDate, truncateId, generateIdempotencyKey } from '../utils/helpers';
import { Wallet, Plus, RefreshCw, ChevronRight } from 'lucide-react';

export function AccountsPage({ onNavigate, onSelectAccount, onShowToast }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [showModal, setShowModal] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountsApi.getAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      onShowToast?.(err.message || 'Error loading accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreatingAccount(true);
    try {
      await accountsApi.createAccount(selectedCurrency);
      onShowToast?.(`Successfully opened new ${selectedCurrency} account!`, 'success');
      setShowModal(false);
      loadAccounts();
    } catch (err) {
      onShowToast?.(err.message || 'Error creating account', 'error');
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleQuickFund = async (accountId) => {
    try {
      const amount = 5000;
      await transactionsApi.fundFromTreasury({
        toAccount: accountId,
        amount,
        idempotencyKey: generateIdempotencyKey()
      });
      onShowToast?.(`Successfully credited ₹${amount.toLocaleString('en-IN')} from Treasury!`, 'success');
      loadAccounts();
    } catch (err) {
      onShowToast?.(err.message || 'Treasury error', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Accounts</h1>
          <p className="text-xs text-slate-500">
            Multi-currency accounts with double-entry balance derivation in INR (₹)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadAccounts}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Account</span>
          </button>
        </div>
      </div>

      {/* Account Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No active accounts</h3>
            <p className="text-xs text-slate-500 mt-1">Open a new checking or savings account to start ledger transfers.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            Open Primary Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc._id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {acc.status}
                  </span>
                  <span className="text-xs text-slate-500 mono font-semibold">{acc.currency}</span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Calculated Ledger Balance</p>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight mono">
                    {formatCurrency(acc.balance, acc.currency)}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 mono space-y-0.5">
                  <p>Account ID: <span className="text-slate-800 font-semibold">{acc._id}</span></p>
                  <p>Opened: {formatDate(acc.createdAt)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectAccount(acc)}
                  className="flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFund(acc._id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-emerald-800 transition cursor-pointer"
                  >
                    + Fund (₹5,000)
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('transfer')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Open New Account */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Open New Banking Account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred account currency. Double-entry ledger will initialize automatically.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label htmlFor="currency-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Currency
                </label>
                <select
                  id="currency-select"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="USD">USD - United States Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Initial balance:</span> ₹0.00. You can fund this account immediately after creation via the treasury injection mechanism.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {creatingAccount ? 'Opening...' : 'Confirm Account Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
