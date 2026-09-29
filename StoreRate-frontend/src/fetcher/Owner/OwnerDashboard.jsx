import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOwnerDashboard,
  clearDashboardError,
} from '../../redux/dashboardSlice';
import {
  Store,
  Star,
  Users,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Mail,
  Copy,
  Check,
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ArrowUpDown,
  MessageSquare
} from 'lucide-react';

export default function OwnerDashboard({ onNavigate }) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user) || (() => {
    try {
      const u = localStorage.getItem('user') || localStorage.getItem('userdata');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const { ownerData, isLoadingOwner, ownerError } = useSelector(
    (state) => state.dashboard
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStarFilter, setSelectedStarFilter] = useState('ALL'); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [copiedEmail, setCopiedEmail] = useState(null);

  useEffect(() => {
    dispatch(fetchOwnerDashboard());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchOwnerDashboard());
  };

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  const store = ownerData?.store || null;
  const averageRatingNum = parseFloat(ownerData?.average_rating || 0);
  const averageRatingFormatted = isNaN(averageRatingNum)
    ? '0.00'
    : averageRatingNum.toFixed(2);
  const users = Array.isArray(ownerData?.users) ? ownerData.users : [];

  const stats = useMemo(() => {
    const totalUsers = users.length;
    if (totalUsers === 0) {
      return {
        total: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
        satisfactionRate: 0,
        distribution: [
          { star: 5, count: 0, percent: 0 },
          { star: 4, count: 0, percent: 0 },
          { star: 3, count: 0, percent: 0 },
          { star: 2, count: 0, percent: 0 },
          { star: 1, count: 0, percent: 0 },
        ],
        latestReviewDate: null,
      };
    }

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let latestDate = null;

    users.forEach((u) => {
      const r = Math.round(Number(u.rating) || 0);
      if (r >= 1 && r <= 5) {
        counts[r] = (counts[r] || 0) + 1;
      }
      if (u.created_at) {
        const d = new Date(u.created_at);
        if (!latestDate || d > latestDate) {
          latestDate = d;
        }
      }
    });

    const highRatings = (counts[5] || 0) + (counts[4] || 0);
    const satisfactionRate = Math.round((highRatings / totalUsers) * 100);

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] || 0,
      percent: Math.round(((counts[star] || 0) / totalUsers) * 100),
    }));

    return {
      total: totalUsers,
      fiveStars: counts[5] || 0,
      fourStars: counts[4] || 0,
      threeStars: counts[3] || 0,
      twoStars: counts[2] || 0,
      oneStar: counts[1] || 0,
      satisfactionRate,
      distribution,
      latestReviewDate: latestDate,
    };
  }, [users]);

  // 4. Filter and sort users list
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Search query: match user_name or email
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          (u.user_name && u.user_name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (selectedStarFilter !== 'ALL') {
      const filterRating = Number(selectedStarFilter);
      list = list.filter((u) => Number(u.rating) === filterRating);
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'highest') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'lowest') {
        return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      if (sortBy === 'name') {
        return (a.user_name || '').localeCompare(b.user_name || '');
      }
      return 0;
    });

    return list;
  }, [users, searchTerm, selectedStarFilter, sortBy]);

  const renderStarIcons = (ratingValue, max = 5, sizeClass = 'w-4 h-4') => {
    const stars = [];
    const val = Number(ratingValue) || 0;
    for (let i = 1; i <= max; i++) {
      const isFilled = i <= Math.floor(val);
      const isHalf = !isFilled && i - val < 1 && i - val > 0;
      stars.push(
        <Star
          key={i}
          className={`${sizeClass} ${isFilled
            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
            : isHalf
              ? 'text-amber-400 fill-amber-200'
              : 'text-slate-200 fill-slate-100'
            }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Rating badge text
  const getRatingBadgeText = (score) => {
    if (score >= 4.7) return { text: 'Outstanding', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 4.0) return { text: 'Very Good', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 3.0) return { text: 'Average', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score > 0) return { text: 'Needs Improvement', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    return { text: 'No Ratings Yet', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const ratingBadge = getRatingBadgeText(averageRatingNum);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Store Owner Portal
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{store?.name || 'My Store Dashboard'}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isLoadingOwner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Store Owner Dashboard"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingOwner ? 'animate-spin text-amber-600' : 'text-slate-500'}`}
            />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Error Alert (if fetch failed) */}
      {ownerError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Unable to fetch dashboard metrics</p>
              <p className="text-xs text-rose-600">{ownerError}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Store Rating
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900">
              {averageRatingFormatted}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {renderStarIcons(averageRatingNum, 5, 'w-3.5 h-3.5')}
            <span className="text-[11px] text-slate-500 font-medium">Average score</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Ratings
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.total}
            </span>
            <span className="text-xs font-semibold text-slate-400">users</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Verified platform users who submitted a rating
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              5-Star Ratings
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats.fiveStars}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({stats.total > 0 ? Math.round((stats.fiveStars / stats.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Total users awarding top 5-star ratings
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Users Who Rated Your Store
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed list of all customers, their ratings, and submission timestamps.
              </p>
            </div>
          </div>

          {/* Search, Filter Pills & Sort Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Star Rating Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedStarFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedStarFilter === 'ALL'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedStarFilter(star)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedStarFilter === star
                      ? 'bg-white text-amber-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {isLoadingOwner && users.length === 0 ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 rounded-sm" />
                    <div className="h-3 w-48 bg-slate-200 rounded-sm" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-200 rounded-sm" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              {users.length === 0
                ? 'No Ratings Submitted Yet'
                : 'No Ratings Match Your Filter'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
              {users.length === 0
                ? `Customers have not submitted ratings for ${store?.name || 'this store'} yet. Once a user reviews your store, their details and rating will appear here.`
                : 'Try adjusting your search keywords or clearing the star filter to see more user reviews.'}
            </p>
            {(searchTerm || selectedStarFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStarFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4 sm:px-6">Email Address</th>
                  <th className="py-3.5 px-4 sm:px-6">Rating Submitted</th>
                  <th className="py-3.5 px-4 sm:px-6">Date & Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const rating = Number(user.rating) || 0;
                  const isCopied = copiedEmail === user.email;

                  return (
                    <tr
                      key={user.user_id || `${user.email}-${user.created_at}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {getInitials(user.user_name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {user.user_name || 'Verified Customer'}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              User ID #{user.user_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email Address with Copy Button */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-medium">
                            {user.email || 'N/A'}
                          </span>
                          {user.email && (
                            <button
                              onClick={() => handleCopyEmail(user.email)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={isCopied ? 'Copied!' : 'Copy Email'}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Rating Submitted (Stars + Badge) */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {renderStarIcons(rating, 5, 'w-4 h-4')}
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {rating} / 5 ★
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Timestamp */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of{' '}
            <strong>{users.length}</strong> total submitted ratings
          </span>
          <span className="text-[11px] text-slate-400">
            Ratings API source: <code>/api/dashboard/owner</code>
          </span>
        </div>
      </div>
    </div>
  );
}
