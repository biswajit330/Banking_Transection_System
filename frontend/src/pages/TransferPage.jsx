import React, { useState, useEffect } from 'react';
import { accountsApi, transactionsApi } from '../services/api';
import { formatCurrency, generateIdempotencyKey, truncateId } from '../utils/helpers';
import { ArrowLeftRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export function TransferPage({ onNavigate, onShowToast }) {
  const [accounts, setAccounts] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());
  const [statusResult, setStatusResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accRes, dirRes] = await Promise.all([
        accountsApi.getAccounts(),
        accountsApi.getDirectory()
      ]);

      const userAccounts = accRes.accounts || [];
      const counterparties = dirRes.directory || [];

      setAccounts(userAccounts);
      setDirectory(counterparties);

      if (userAccounts.length > 0 && !fromAccount) {
        setFromAccount(userAccounts[0]._id);
      }

      if (counterparties.length > 0 && !toAccount) {
        setToAccount(counterparties[0].accountId);
      } else if (userAccounts.length > 1 && !toAccount) {
        setToAccount(userAccounts[1]._id);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Error loading transfer directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedSourceAccount = accounts.find((a) => a._id === fromAccount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusResult(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      onShowToast?.('Please enter a valid amount greater than ₹0', 'error');
      return;
    }

    if (selectedSourceAccount && selectedSourceAccount.balance < numAmount) {
      onShowToast?.(`Insufficient balance. Account balance is ${formatCurrency(selectedSourceAccount.balance)}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transactionsApi.createTransfer({
        fromAccount,
        toAccount,
        amount: numAmount,
        idempotencyKey
      });

      setStatusResult({
        success: true,
        message: res.message,
        transaction: res.transaction,
        status: res.status
      });

      onShowToast?.('Transfer processed successfully via ACID session!', 'success');
      // Update accounts balance
      const updatedAcc = await accountsApi.getAccounts();
      setAccounts(updatedAcc.accounts || []);
    } catch (err) {
      setStatusResult({
        success: false,
        message: err.message || 'Transaction processing failed'
      });
      onShowToast?.(err.message || 'Transfer failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey());
    setStatusResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Execute Fund Transfer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Atomic double-entry transaction engine in INR (₹) with debit/credit ledger commit and idempotency protection.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Source Account */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="from-account-select" className="text-xs font-semibold text-slate-700">
                Source Account (DEBIT)
              </label>
              {selectedSourceAccount && (
                <span className="text-xs text-emerald-700 mono font-semibold">
                  Available: {formatCurrency(selectedSourceAccount.balance, selectedSourceAccount.currency)}
                </span>
              )}
            </div>

            <select
              id="from-account-select"
              required
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  Account {truncateId(acc._id, 10)} &bull; Balance: {formatCurrency(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Account */}
          <div>
            <label htmlFor="to-account-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Account (CREDIT)
            </label>
            <select
              id="to-account-select"
              required
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
            >
              <optgroup label="Counterparty Directory">
                {directory.map((c) => (
                  <option key={c.accountId} value={c.accountId}>
                    {c.holderName} ({c.holderEmail}) &bull; {truncateId(c.accountId, 10)}
                  </option>
                ))}
              </optgroup>
              {accounts.length > 1 && (
                <optgroup label="My Other Accounts">
                  {accounts
                    .filter((a) => a._id !== fromAccount)
                    .map((a) => (
                      <option key={a._id} value={a._id}>
                        My Account {truncateId(a._id, 10)} &bull; {formatCurrency(a.balance, a.currency)}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Amount and Idempotency Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="transfer-amount-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount to Transfer (₹)
              </label>
              <input
                id="transfer-amount-input"
                type="number"
                min="0.01"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500.00"
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="idempotency-key-input" className="text-xs font-semibold text-slate-700">
                  Idempotency Key
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                >
                  Generate New
                </button>
              </div>
              <input
                id="idempotency-key-input"
                type="text"
                required
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
              />
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>ACID Replica Set Session</span>
            </div>
            <p>
              Re-submitting with an identical idempotency key safely returns the existing transaction without executing duplicate debits.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || accounts.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{submitting ? 'Executing in MongoDB Session...' : 'Execute Double-Entry Transfer (₹)'}</span>
          </button>
        </form>

        {/* Transaction Result Display */}
        {statusResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              statusResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {statusResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusResult.message}</span>
            </div>
            {statusResult.transaction && (
              <div className="mono text-[11px] space-y-1 pt-2 border-t border-emerald-200">
                <p>Transaction ID: <strong className="text-slate-900">{statusResult.transaction._id}</strong></p>
                <p>Status: <strong className="text-emerald-700">{statusResult.transaction.status}</strong></p>
                <p>Idempotency Key: <span className="text-slate-600">{statusResult.transaction.idempotencyKey}</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
