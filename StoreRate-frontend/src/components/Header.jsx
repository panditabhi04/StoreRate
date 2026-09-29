import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Plus,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Star,
  KeyRound
} from 'lucide-react';

export default function Header({
  isOpen,
  setIsOpen,
  activeTab,
  setIsMobileOpen,
  onLogout,
  onAddStore,
  onOpenUpdatePassword
}) {
  const authUser = useSelector((state) => state.auth?.user);
  const displayName = authUser?.name || 'Abhishek';
  const displayRole = authUser?.role || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AP';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'New 5-Star Rating!',
      desc: 'Tech Haven received a 5★ review from John Doe.',
      time: '5m ago',
      icon: Star,
      iconColor: 'text-amber-500 bg-amber-50'
    },
    {
      id: 2,
      title: 'Store Verification Pending',
      desc: 'Green Grocers submitted documents for review.',
      time: '42m ago',
      icon: AlertCircle,
      iconColor: 'text-blue-500 bg-blue-50'
    },
    {
      id: 3,
      title: 'Weekly Report Ready',
      desc: 'Ratings summary for September is ready for export.',
      time: '2h ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-50'
    }
  ];

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'users':
        return 'User Management';
      case 'stores':
        return 'Stores Directory';
      case 'admin-users':
        return 'Admin User Management';
      case 'ratings':
        return 'Ratings & Feedback';
      default:
        return 'StoreRate';
    }
  };

  return (
    <header className="shrink-0 sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex lg:hidden items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          title={isOpen ? 'Collapse Sidebar (SR)' : 'Expand Sidebar (StoreRate)'}
        >
          {isOpen ? (
            <PanelLeftClose className="w-5 h-5 text-slate-600" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Breadcrumb & Title */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>StoreRate</span>
            <span>/</span>
            <span className="capitalize text-slate-600 font-semibold">{activeTab}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate m-0">
            {getPageTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar */}
      {/* <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores, users, ratings..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div> */}

      {/* Right: Quick Action, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* {onAddStore && (
          <button
            onClick={onAddStore}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        )} */}



        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{displayName}</span>
              <span className="text-[10px] font-medium text-slate-400 capitalize">{displayRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{authUser?.email || 'user@storerate.com'}</p>
                {authUser?.address && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">📍 {authUser.address}</p>
                )}
                <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {displayRole}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-100 space-y-0.5">
                {/* STRICT REQUIREMENT: Only normal user (role: 'USER') can update their password */}
                {((authUser?.role || '').trim().toUpperCase() === 'USER') && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenUpdatePassword) onOpenUpdatePassword();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Update Password</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
