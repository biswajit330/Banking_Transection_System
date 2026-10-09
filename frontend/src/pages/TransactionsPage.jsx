import React, { useState, useEffect } from 'react';
import { transactionsApi, accountsApi } from '../services/api';
import { formatCurrency, formatDate, truncateId } from '../utils/helpers';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Search } from 'lucide-react';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';

export function TransactionsPage({ onShowToast }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, INBOUND, OUTBOUND
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, accRes] = await Promise.all([
        transactionsApi.getTransactions(),
        accountsApi.getAccounts()
      ]);
      setTransactions(txRes.transactions || []);
      setAccounts(accRes.accounts || []);
    } catch (err) {
      onShowToast?.(err.message || 'Error loading transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const isOutbound = accounts.some((a) => a._id === (tx.fromAccount?._id || tx.fromAccount));
    const isInbound = accounts.some((a) => a._id === (tx.toAccount?._id || tx.toAccount));

    if (filterType === 'OUTBOUND' && (!isOutbound || isInbound)) return false;
    if (filterType === 'INBOUND' && (!isInbound || (isOutbound && !isInbound))) return false;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const idMatch = tx._id.toLowerCase().includes(query);
      const idemMatch = tx.idempotencyKey.toLowerCase().includes(query);
      const amountMatch = String(tx.amount).includes(query);
      return idMatch || idemMatch || amountMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions History</h1>
          <p className="text-xs text-slate-500">
            Immutable transaction log executed via atomic database sessions in INR (₹)
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, key, amount..."
            className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
          {['ALL', 'INBOUND', 'OUTBOUND'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === type
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All' : type === 'INBOUND' ? 'Inbound (+)' : 'Outbound (-)'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Source Account</th>
                <th className="px-4 py-3">Destination Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Idempotency Key</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    Loading transactions history...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No transactions match your search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isOutbound = accounts.some(
                    (a) => a._id === (tx.fromAccount?._id || tx.fromAccount)
                  );
                  const isInbound = accounts.some(
                    (a) => a._id === (tx.toAccount?._id || tx.toAccount)
                  );
                  const isDebit = isOutbound && !isInbound;

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 mono">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={`inline-flex items-center space-x-1 ${isDebit ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {isDebit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          <span>{isDebit ? 'DEBIT (OUT)' : 'CREDIT (IN)'}</span>
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-bold mono ${isDebit ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 mono text-slate-600">
                        {truncateId(tx.fromAccount?._id || tx.fromAccount, 10)}
                      </td>
                      <td className="px-4 py-3 mono text-slate-600">
                        {truncateId(tx.toAccount?._id || tx.toAccount, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 mono text-slate-400 text-[11px]" title={tx.idempotencyKey}>
                        {truncateId(tx.idempotencyKey, 14)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedTx && (
        <TransactionDetailsModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
