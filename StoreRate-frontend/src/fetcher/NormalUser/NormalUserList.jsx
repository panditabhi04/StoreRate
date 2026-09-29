import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, fetchStores } from '../../redux/adminSlice';
import { API_BASE_URL } from '../../config/api';
import {
  Search,
  UserPlus,
  Mail,
  MapPin,
  RefreshCw,
  Info,
  X,
  Copy,
  Check,
  UserCheck,
  Users,
  Star,
  Store
} from 'lucide-react';

export default function UsersPage({ onAddUser }) {
  const dispatch = useDispatch();
  const { users: reduxUsers, isLoadingUsers, stores: reduxStores } = useSelector(
    (state) => state.admin
  );

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const defaultUsers = [
    {
      id: 25,
      name: 'Abhishek Pandit',
      email: 'abhishekpandit1104@gmail.com',
      address: 'pune',
      role: 'USER'
    },
    {
      id: 24,
      name: 'Raj Tople',
      email: 'rajt@gmail.com',
      address: 'Pune , Maharashtra',
      role: 'USER'
    },
    {
      id: 23,
      name: 'Vishal Store Rate User',
      email: 'Vishal@storerate.com',
      address: 'Kothrud, Pune, Maharashtra',
      role: 'USER'
    },
    {
      id: 22,
      name: 'Raj Tabhekar',
      email: 'raj@gmail.com',
      address: 'Pune , Maharashtra',
      role: 'USER'
    },
    {
      id: 21,
      name: 'Priya Kokani Normal User',
      email: 'priya@user.com',
      address: 'Ratnagiri, Maharashtra',
      role: 'USER'
    },
    {
      id: 20,
      name: 'Amit Mule Normal User',
      email: 'amit@user.com',
      address: 'Sangali, Maharashtra',
      role: 'USER'
    },
    {
      id: 19,
      name: 'Rahul Patil Normal User',
      email: 'rahul@user.com',
      address: 'Pune, Maharashtra',
      role: 'USER'
    }
  ];
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchStores());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchStores());
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const rawList = Array.isArray(reduxUsers) && reduxUsers.length > 0 ? reduxUsers : defaultUsers;
  const normalOnlyUsers = rawList.filter(
    (u) => (u.role || '').trim().toUpperCase() === 'USER'
  );

  const filteredUsers = normalOnlyUsers.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const address = (u.address || '').toLowerCase();
    return name.includes(q) || email.includes(q) || address.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Registered standard users with <code className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold text-xs border border-emerald-200/60">role: USER</code> from <code className="text-xs text-slate-600">/api/new-user</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoadingUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title={`Refresh from ${API_BASE_URL}/new-user`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onAddUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search normal users by name, email, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Stats Pill */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Role: USER ({normalOnlyUsers.length})</span>
          </span>

          <span className="text-xs text-slate-400 whitespace-nowrap pl-2 border-l border-slate-200">
            Showing <strong className="text-slate-700">{filteredUsers.length}</strong> normal users
          </span>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoadingUsers && normalOnlyUsers.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200" />
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="py-4 px-4 sm:px-6 text-right"><div className="h-7 w-14 bg-slate-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {search ? 'No Users Match Search' : 'No Normal Users Found'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        {search
                          ? `No users with role: USER match "${search}".`
                          : 'There are no users with role: "USER" returned from /api/new-user.'}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCopied = copiedEmail === user.email;

                  return (
                    <tr
                      key={user.id || user.email}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block truncate">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: #{user.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${user.email}`}
                            className="font-medium text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1.5 truncate max-w-[200px]"
                            title={user.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </a>
                          <button
                            onClick={() => handleCopyEmail(user.email)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {user.address || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Role & Store Owner Rating */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const userStores = (reduxStores || []).filter(
                            (s) =>
                              Number(s.owner_id) === Number(user.id) ||
                              (s.owner_name &&
                                user.name &&
                                s.owner_name.toLowerCase().trim() ===
                                  user.name.toLowerCase().trim())
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
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                <span>USER</span>
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
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

        {/* Footer info banner */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Endpoint: <code>GET /api/new-user</code></span>
          </div>
          <div>
            <span>Filter applied: <strong>role === "USER"</strong></span>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
                {getInitials(selectedUser.name)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <UserCheck className="w-3.5 h-3.5" />
                  Role: USER (Normal User)
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  User ID
                </span>
                <p className="font-mono font-semibold text-slate-800">#{selectedUser.id}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name
                </span>
                <p className="font-semibold text-slate-800">{selectedUser.name}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
                <p className="font-medium text-slate-800 break-all">{selectedUser.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Registered Address
                </span>
                <p className="font-medium text-slate-800">{selectedUser.address || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Account Role
                </span>
                <p className="font-bold text-emerald-700">USER (Normal Platform Reviewer)</p>
              </div>

              {(() => {
                const userStores = (reduxStores || []).filter(
                  (s) =>
                    Number(s.owner_id) === Number(selectedUser.id) ||
                    (s.owner_name &&
                      selectedUser.name &&
                      s.owner_name.toLowerCase().trim() ===
                        selectedUser.name.toLowerCase().trim())
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

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
