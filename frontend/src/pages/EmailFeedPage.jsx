import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Mail, RefreshCw, Send } from 'lucide-react';

export function EmailFeedPage({ onShowToast }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getSimulatedEmails();
      setEmails(res.emails || []);
    } catch (err) {
      onShowToast?.(err.message || 'Error loading email notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Email Feed</h1>
          <p className="text-xs text-slate-500">
            Outbound transactional emails dispatched by nodemailer service (simulated delivery in development)
          </p>
        </div>

        <button
          type="button"
          onClick={loadEmails}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        </div>
      ) : emails.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <Mail className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">No emails sent in this session yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{email.subject}</h3>
                    <p className="text-[11px] text-slate-500 mono">To: {email.to}</p>
                  </div>
                </div>
                <span className="text-slate-400 mono text-[11px] self-start sm:self-auto">
                  {formatDate(email.sentAt)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {email.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
