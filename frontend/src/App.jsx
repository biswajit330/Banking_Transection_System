import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountsPage } from './pages/AccountsPage';
import { AccountDetailsPage } from './pages/AccountDetailsPage';
import { TransferPage } from './pages/TransferPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { LedgerAuditPage } from './pages/LedgerAuditPage';
import { EmailFeedPage } from './pages/EmailFeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setActivePage('account-details');
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  // Unauthenticated / Auth Gateway view in Light Theme
  const unauthenticatedView = (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
        {activePage === 'register' ? (
          <RegisterPage onNavigate={setActivePage} onShowToast={showToast} />
        ) : (
          <LoginPage onNavigate={setActivePage} onShowToast={showToast} />
        )}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        LedgerPay Banking Core &bull; Double-Entry Accounting
      </footer>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );

  return (
    <ProtectedRoute fallback={unauthenticatedView} onRedirectToLogin={() => setActivePage('login')}>
      {/* Secured Authenticated Banking Dashboard Environment in Light Theme */}
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <Navbar activePage={activePage} onNavigate={setActivePage} />

        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {activePage === 'dashboard' && (
              <Dashboard
                onNavigate={setActivePage}
                onSelectAccount={handleSelectAccount}
                onSelectTransaction={handleSelectTransaction}
                onShowToast={showToast}
              />
            )}

            {activePage === 'accounts' && (
              <AccountsPage
                onNavigate={setActivePage}
                onSelectAccount={handleSelectAccount}
                onShowToast={showToast}
              />
            )}

            {activePage === 'account-details' && selectedAccount && (
              <AccountDetailsPage
                account={selectedAccount}
                onBack={() => setActivePage('accounts')}
                onNavigate={setActivePage}
                onShowToast={showToast}
              />
            )}

            {activePage === 'transfer' && (
              <TransferPage
                onNavigate={setActivePage}
                onShowToast={showToast}
              />
            )}

            {activePage === 'transactions' && (
              <TransactionsPage
                onShowToast={showToast}
              />
            )}

            {activePage === 'ledger' && (
              <LedgerAuditPage
                onShowToast={showToast}
              />
            )}

            {activePage === 'emails' && (
              <EmailFeedPage
                onShowToast={showToast}
              />
            )}

            {activePage === 'profile' && (
              <ProfilePage
                onNavigate={setActivePage}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          LedgerPay &bull; Double-Entry Financial Engine &bull; MongoDB ACID Transaction Session
        </footer>

        {/* Global Transaction Details Inspection Modal */}
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}

        {/* Toast notification overlay */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </ProtectedRoute>
  );
}
