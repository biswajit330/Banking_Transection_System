import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

export function RegisterPage({ onNavigate, onShowToast }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      onShowToast?.('Account created successfully! Welcome to LedgerPay.', 'success');
      onNavigate('dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Open Ledger Account</h1>
        <p className="text-xs text-slate-500">
          Register with our double-entry banking system with real-time auditability.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              id="reg-name"
              type="text"
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rohan Sharma"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@example.com"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password (Min 6 Characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
        >
          Sign In here
        </button>
      </div>
    </div>
  );
}
