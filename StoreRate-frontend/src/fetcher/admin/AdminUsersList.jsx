import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, fetchStores, clearAdminStatus } from '../../redux/adminSlice';
import { API_BASE_URL } from '../../config/api';
import {
  Shield,
  ShieldCheck,
  Search,
  UserPlus,
  RefreshCw,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Filter,
  UserCheck,
  SlidersHorizontal,
  Info,
  Star,
  Store
} from 'lucide-react';

export default function AdminUsersPage({ onAddAdminUser }) {
  const dispatch = useDispatch();
  const { adminUsers, isLoadingAdminUsers, adminUsersError, stores: reduxStores } =
    useSelector((state) => state.admin);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch admin users list and stores on mount
  useEffect(() => {
    dispatch(fetchAdminUsers());
    dispatch(fetchStores());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminUsers());
    dispatch(fetchStores());
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredAdmins = (adminUsers || []).filter((admin) => {
    const name = (admin.name || '').toLowerCase();
    const email = (admin.email || '').toLowerCase();
    const address = (admin.address || '').toLowerCase();
    const role = (admin.role || 'ADMIN').toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch =
      query === '' ||
      name.includes(query) ||
      email.includes(query) ||
      address.includes(query);

    const matchesRole =
      filterRole === 'all' || role.includes(filterRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Admin User Management</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            System Administrators with privileged access to manage stores, users, and platform ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoadingAdminUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Admin Users from API"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingAdminUsers ? 'animate-spin text-indigo-600' : ''
                }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onAddAdminUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin User</span>
          </button>
        </div>
      </div>

      {adminUsersError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Unable to load admin users from backend</p>
              <p className="text-xs text-rose-600 mt-0.5">{adminUsersError}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, email, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All Admins ({adminUsers?.length || 0})
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterRole === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Admins
            </button>
          </div>

          <span className="text-xs text-slate-400 whitespace-nowrap pl-2 border-l border-slate-200">
            Showing <strong className="text-slate-700">{filteredAdmins.length}</strong> accounts
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Admin User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined / Created</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Loading Skeleton */}
              {isLoadingAdminUsers && adminUsers.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="h-8 w-16 bg-slate-100 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                        <Shield className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {search ? 'No Admin Users Match Your Search' : 'No Admin Users Found'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                        {search
                          ? `No admin accounts match "${search}". Try clearing your search query.`
                          : `Create your first administrator account using the API endpoint ${API_BASE_URL}/admin.`}
                      </p>
                      {search ? (
                        <button
                          onClick={() => setSearch('')}
                          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Clear Search
                        </button>
                      ) : (
                        <button
                          onClick={onAddAdminUser}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add First Admin User</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, idx) => {
                  const roleName = admin.role || 'ADMIN';
                  const initials = getInitials(admin.name);
                  const isCurrentCopied = copiedEmail === admin.email;

                  return (
                    <tr
                      key={admin.id || admin._id || admin.email || idx}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs uppercase">
                              {initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{admin.name || 'Unnamed Admin'}</span>
                            </div>
                            <span className="text-[11px] font-medium text-indigo-600 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              System Administrator
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${admin.email}`}
                            className="font-medium text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5 truncate max-w-[200px]"
                            title={admin.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{admin.email}</span>
                          </a>
                          <button
                            onClick={() => handleCopyEmail(admin.email)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {isCurrentCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[220px]">
                            {admin.address || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {(() => {
                          const userStores = (reduxStores || []).filter(
                            (s) =>
                              Number(s.owner_id) === Number(admin.id) ||
                              (s.owner_name &&
                                admin.name &&
                                s.owner_name.toLowerCase().trim() ===
                                  admin.name.toLowerCase().trim())
                          );
                          const isStoreOwner = userStores.length > 0;
                          const ownerAvgRating = isStoreOwner
                            ? (
                                userStores.reduce(
                                  (sum, s) =>
                                    sum + parseFloat(s.average_rating || 0),
                                  0
                                ) / userStores.length
                              ).toFixed(2)
                            : null;

                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
                                <Shield className="w-3 h-3 text-purple-600" />
                                <span>{roleName.toUpperCase()}</span>
                              </span>
                              {isStoreOwner && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                  title={`Owned stores: ${userStores.map((s) => `${s.name} (${s.average_rating || '0.00'}★)`).join(', ')}`}
                                >
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>Owner: {ownerAvgRating} ★</span>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(admin.createdAt || admin.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => setSelectedAdmin(admin)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Connected to backend API: <code>/api/admin</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Privileged Access: <strong>System Administrator</strong></span>
          </div>
        </div>
      </div>
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/20">
                  {getInitials(selectedAdmin.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedAdmin.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {selectedAdmin.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
                <p className="font-medium text-slate-800 break-all">{selectedAdmin.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Address
                </span>
                <p className="font-medium text-slate-800">{selectedAdmin.address || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Account Type & Privileges
                </span>
                <p className="font-medium text-slate-800">
                  Full Administrative Privileges (Stores, Users, Ratings Management)
                </p>
              </div>

              {(() => {
                const userStores = (reduxStores || []).filter(
                  (s) =>
                    Number(s.owner_id) === Number(selectedAdmin.id) ||
                    (s.owner_name &&
                      selectedAdmin.name &&
                      s.owner_name.toLowerCase().trim() ===
                        selectedAdmin.name.toLowerCase().trim())
                );
                if (userStores.length === 0) return null;
                const ownerAvgRating = (
                  userStores.reduce(
                    (sum, s) => sum + parseFloat(s.average_rating || 0),
                    0
                  ) / userStores.length
                ).toFixed(2);

                return (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        Store Owner Rating
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {ownerAvgRating} / 5.00
                      </span>
                    </span>
                    <div className="space-y-1.5">
                      {userStores.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-amber-100"
                        >
                          <span className="font-semibold text-slate-800 truncate mr-2">
                            {st.name}
                          </span>
                          <span className="font-bold text-amber-700 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {st.average_rating || '0.00'} / 5.00
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
