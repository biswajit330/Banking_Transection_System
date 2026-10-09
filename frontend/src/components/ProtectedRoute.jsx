import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, fallback = null, onRedirectToLogin }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying banking authentication session...</p>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Authentication Required</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This protected financial section requires an active authenticated banking session.
          </p>
        </div>
        {onRedirectToLogin && (
          <button
            type="button"
            onClick={onRedirectToLogin}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            Go to Login
          </button>
        )}
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
