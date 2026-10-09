import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { User, ShieldCheck, Mail, Calendar, Key, LogOut } from 'lucide-react';

export function ProfilePage({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onShowToast?.('Logged out successfully', 'info');
    onNavigate('login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Account details and cryptographic authentication session status
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user?.name}</h2>
            <p className="text-xs text-slate-500 mono">{user?.email}</p>
            <div className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Banking Customer</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>User ID</span>
            </span>
            <span className="text-slate-900 mono font-semibold">{user?.id}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email Address</span>
            </span>
            <span className="text-slate-900 mono">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Registration Date</span>
            </span>
            <span className="text-slate-900">{formatDate(user?.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 flex items-center space-x-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Session Type</span>
            </span>
            <span className="text-emerald-700 font-mono font-semibold">JWT Bearer & httpOnly Cookie</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Authentication Session (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
