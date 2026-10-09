import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  FileCheck2,
  Mail,
  User
} from 'lucide-react';

export function Navbar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transfer', label: 'Transfer Funds', icon: ArrowLeftRight },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'ledger', label: 'Ledger Audit', icon: FileCheck2 },
    { id: 'emails', label: 'Email Feed', icon: Mail },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleMobileNav = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0">
              LP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors leading-none">
                LedgerPay
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline leading-tight mt-0.5">
                Double-Entry Core
              </span>
            </div>
          </button>

          <span className="hidden sm:inline-block text-slate-300">/</span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-medium capitalize">
            {activePage}
          </span>
        </div>

        {/* Zone 2: System Security Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Double-Entry ACID &bull; INR Standard (₹)</span>
        </div>

        {/* Zone 3: User Profile & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mono leading-tight truncate max-w-[120px]">{user.email}</p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Log out of session"
                aria-label="Log out"
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('login')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 sm:px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Accordion / Drawer Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-lg animate-fadeIn">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
            Navigation Menu
          </p>
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  type="button"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span>Signed in as <strong className="text-slate-800">{user.name}</strong></span>
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              className="text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
