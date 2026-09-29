import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats, clearDashboardError } from '../redux/dashboardSlice';
import {
  Users,
  Store,
  Star,
  ShieldAlert,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import OwnerDashboard from '../fetcher/Owner/OwnerDashboard';

export default function DashboardPage({
  onNavigate,
  onOpenAddStore,
  onOpenAddNormalUser,
  onOpenAddAdminUser
}) {
  const dispatch = useDispatch();

  // 1. Get logged in user from Redux auth state (with fallback to localStorage)
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

  // View mode for Admin (allows admin to toggle between System Stats and Owner Portal)
  const [adminViewMode, setAdminViewMode] = React.useState('system'); // 'system' | 'owner'

  // 2. Read live dashboard metrics from Redux dashboardSlice
  const { stats, isLoading, error } = useSelector((state) => state.dashboard);

  // 3. Dispatch Redux asyncThunk to fetch http://localhost:3000/api/dashboard for admin
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, isAdmin]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
  };

  // If user is a Store Owner (and not an Admin), immediately render the Store Owner Dashboard
  if (isStoreOwner && !isAdmin) {
    return <OwnerDashboard onNavigate={onNavigate} />;
  }

  // Guard: If user is neither an Admin nor a Store Owner (standard normal user)
  if (!isAdmin && !isStoreOwner) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-xs text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Dashboard Restricted
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The Dashboard is available for System Administrators and Store Owners.
          Your current account role is <span className="font-semibold text-slate-700">{authUser?.role || 'USER'}</span>.
        </p>
        {onNavigate && (
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('stores')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Browse Stores
            </button>
          </div>
        )}
      </div>
    );
  }

  // If Admin toggles to Owner Dashboard view
  if (isAdmin && adminViewMode === 'owner') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600">
            Viewing: <strong className="text-amber-700">Store Owner Dashboard View</strong>
          </span>
          <button
            onClick={() => setAdminViewMode('system')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            ← Back to System Admin Stats
          </button>
        </div>
        <OwnerDashboard onNavigate={onNavigate} />
      </div>
    );
  }

  // The 3 Requested Metric Cards driven by Redux state
  const cards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Registered users in system'
    },
    {
      title: 'Total Stores',
      value: stats.total_stores,
      icon: Store,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Registered active stores'
    },
    {
      title: 'Total Submitted Ratings',
      value: stats.total_ratings,
      icon: Star,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      description: 'Total user reviews submitted'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Administrator Dashboard</h2>
          <p className="text-xs text-slate-500">Live platform overview and administrative management tools</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setAdminViewMode('owner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Switch to Store Owner Dashboard View"
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>Store Owner View</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh statistics via Redux"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh Live Stats</span>
          </button>
        </div>
      </div>

      {/* Error Notice (if Redux asyncThunk rejected) */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="font-semibold underline hover:no-underline text-rose-800 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* The 3 Admin Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {card.title}
                </span>
                <div className={`p-3 rounded-2xl ${card.bgColor} ${card.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                {isLoading ? (
                  <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg my-1" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Admin Action Management Section: Add Stores, Normal Users, and Admin Users */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Management Actions</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Add New Store Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Commercial Stores</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Add new retail stores with name, email, and address for customer ratings and reviews.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={onOpenAddStore}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>+ Add New Store</span>
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('stores')}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition-colors cursor-pointer"
                >
                  View Stores Directory →
                </button>
              )}
            </div>
          </div>

          {/* 2. Add Normal User Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Normal Users</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Register standard platform user accounts with name, email, address, and password.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={onOpenAddNormalUser}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>+ Add Normal User</span>
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('users')}
                  className="w-full text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1 transition-colors cursor-pointer"
                >
                  View Users Management →
                </button>
              )}
            </div>
          </div>

          {/* 3. Add Admin User Card */}
          <div className="bg-white rounded-2xl border border-indigo-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-indigo-50/40 to-white">
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase">
              System Admin
            </span>

            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Admin Users</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Create privileged administrators via API (<code>/api/admin</code>) and view table list.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-100/60">
              <button
                onClick={onOpenAddAdminUser}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>+ Add Admin User</span>
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('admin-users')}
                  className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 transition-colors cursor-pointer"
                >
                  View Admins Table (API) →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
