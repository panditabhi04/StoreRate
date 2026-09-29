import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { LogOut, X } from 'lucide-react';

export default function Layout({
  children,
  activeTab = 'dashboard',
  setActiveTab = () => {},
  onAddStore,
  onOpenAddStore,
  onOpenAddNormalUser,
  onOpenAddAdminUser,
  onOpenUpdatePassword,
  onLogout
}) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('storerate_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('storerate_sidebar_open', JSON.stringify(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleAddStoreAction = onOpenAddStore || onAddStore;

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
        onOpenAddStore={handleAddStoreAction}
        onOpenAddNormalUser={onOpenAddNormalUser}
        onOpenAddAdminUser={onOpenAddAdminUser}
        onOpenUpdatePassword={onOpenUpdatePassword}
      />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          activeTab={activeTab}
          setIsMobileOpen={setIsMobileOpen}
          onLogout={handleLogout}
          onAddStore={handleAddStoreAction}
          onOpenUpdatePassword={onOpenUpdatePassword}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Sign Out</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to log out of your StoreRate session?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
