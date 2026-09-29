import React from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
  Bell,
  Plus,
  UserPlus,
  KeyRound
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
  onOpenAddStore,
  onOpenAddNormalUser,
  onOpenAddAdminUser,
  onOpenUpdatePassword
}) {
  const authUser = useSelector((state) => state.auth?.user) || (() => {
    try {
      const u = localStorage.getItem('user') || localStorage.getItem('userdata');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (authUser?.role || 'USER').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isStoreOwner =
    userRole === 'STORE_OWNER' ||
    userRole === 'OWNER' ||
    userRole.includes('OWNER') ||
    !!authUser?.is_owner;

  // Navigation items:
  // When role is ADMIN: Show full management (Dashboard, Users, Stores, Admin Users, Ratings)
  // When role is USER: Do NOT show Users, Admin Users, or Dashboard! ONLY show Stores & Ratings
  const mainNavItems = isAdmin
    ? [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        badge: 'Live',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      },
      {
        id: 'stores',
        label: 'Stores',
        icon: Store,
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
      },
      {
        id: 'admin-users',
        label: 'Admin Users',
        icon: ShieldCheck,
        badge: 'Admin',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      },
      // {
      //   id: 'ratings',
      //   label: 'Ratings',
      //   icon: Star,
      //   badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      // },
    ]
    : isStoreOwner
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'Owner',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        },
        {
          id: 'stores',
          label: 'Stores',
          icon: Store,
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        },
      ]
    : [
        {
          id: 'stores',
          label: 'Stores',
          icon: Store,
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        },
      ];

  // Additional management & configuration items to showcase sidebar's own vertical scrolling
  const secondaryNavItems = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      badge: 'New',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      badge: '3',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    },
    {
      id: 'help',
      label: 'Help & Docs',
      icon: HelpCircle
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => handleNavClick(item.id)}
          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            } ${!isOpen ? 'justify-center px-0' : ''}`}
        >
          <Icon
            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'
              } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
          />

          {isOpen && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${isActive
                    ? 'bg-white/20 text-white border-white/25'
                    : item.badgeColor
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
          )}

          {isActive && !isOpen && (
            <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-md" />
          )}
        </button>

        {/* Floating Tooltip in collapsed mode */}
        {!isOpen && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-medium rounded-md shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 flex items-center gap-2">
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                {item.badge}
              </span>
            )}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed / Static height h-screen with independent vertical scroll */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col h-screen shrink-0 bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out select-none shadow-2xl lg:sticky lg:top-0 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isOpen ? 'w-64' : 'w-20'}`}
      >
        {/* 1. Static Brand Header (Pinned at Top) */}
        <div className="shrink-0 flex items-center justify-between h-18 px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 shadow-md shadow-indigo-500/25 group cursor-pointer">
              <span className="font-extrabold text-white tracking-wider text-base">
                {isOpen ? (
                  <Store className="w-5 h-5 text-white" />
                ) : (
                  'SR'
                )}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            {isOpen && (
              <div className="flex flex-col min-w-0 transition-opacity duration-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    StoreRate
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">Store & Rating Hub</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse sidebar (SR)' : 'Expand sidebar (StoreRate)'}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 2. Scrollable Middle Area: HAS ITS OWN INDEPENDENT VERTICAL SCROLLBAR */}
        <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden space-y-4 sidebar-scrollbar">
          {/* Main Navigation Section */}
          <div className="space-y-1.5">
            {isOpen && (
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Main
              </div>
            )}
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Admin Quick Add Actions (Stores, Normal Users, Admin Users) */}

        </div>

        {/* 3. Static Bottom Section: Normal User / Store Owner Password Update + Logout */}
        <div className="shrink-0 p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-1.5">
          {/* Normal users and Store Owners can update their password */}
          {!isAdmin && onOpenUpdatePassword && (
            <div className="relative group">
              <button
                onClick={onOpenUpdatePassword}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer ${!isOpen ? 'justify-center px-0' : ''
                  }`}
                title="Update Password"
              >
                <KeyRound className={`shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'} text-indigo-400`} />
                {isOpen && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">Update Password</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {isStoreOwner ? 'Owner' : 'User'}
                    </span>
                  </div>
                )}
              </button>

              {!isOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-950 text-indigo-200 text-xs font-medium rounded-md shadow-xl border border-indigo-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 flex items-center gap-2">
                  <span>Update Password</span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
                </div>
              )}
            </div>
          )}

          <div className="relative group">
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors duration-200 cursor-pointer ${!isOpen ? 'justify-center px-0' : ''
                }`}
            >
              <LogOut className={`shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
              {isOpen && <span className="truncate">Logout</span>}
            </button>

            {!isOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-rose-950 text-rose-200 text-xs font-medium rounded-md shadow-xl border border-rose-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                Logout
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-950" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
