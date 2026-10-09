import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  FileCheck2,
  Mail,
  User
} from 'lucide-react';

export function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'ledger', label: 'Ledger Audit', icon: FileCheck2 },
    { id: 'emails', label: 'Email Feed', icon: Mail },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-2 sm:p-4 shrink-0 shadow-xs">
      <div className="space-y-1">
        <p className="hidden md:block px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Banking Navigation
        </p>

        {/* Scrollable on mobile, column on desktop */}
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
                className={`flex items-center space-x-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-left shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 hidden md:block">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>Ledger Protocol</span>
            <span className="text-emerald-700 font-bold">ACTIVE</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            All credit and debit records are immutable. Balances are derived dynamically in INR (₹).
          </p>
        </div>
      </div>
    </aside>
  );
}
