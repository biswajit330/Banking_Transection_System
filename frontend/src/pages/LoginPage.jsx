
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export function LoginPage({ onNavigate, onShowToast }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(email, password);

      // Clear input fields after successful login
      setEmail('');
      setPassword('');

      onShowToast?.(
        'Successfully signed in to banking account',
        'success'
      );

      onNavigate('dashboard');
    } catch (err) {
      setErrorMsg(
        err.message || 'Login failed. Please check credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6">

      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to LedgerPay
        </h1>

        <p className="text-xs text-slate-500">
          Access your double-entry accounts with immutable transaction security.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 mono transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </span>

          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Register */}
      <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
        Don't have an account?{' '}

        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
        >
          Create new account
        </button>
      </div>

    </div>
  );
}
