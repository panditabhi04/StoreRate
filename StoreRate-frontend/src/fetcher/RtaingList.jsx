import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores } from '../redux/adminSlice';
import {
  submitRating,
  updateRating,
  fetchUserRatings,
  clearRatingStatus
} from '../redux/ratingSlice';
import {
  Star,
  Store,
  MapPin,
  Mail,
  User,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Award,
  Edit3,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

export default function RtaingList() {
  const dispatch = useDispatch();
  const { stores: reduxStores, isLoadingStores } = useSelector((state) => state.admin);
  const {
    userRatings,
    isSubmitting: isRatingSubmitting,
    error: ratingError,
    successMessage: ratingSuccess
  } = useSelector((state) => state.ratings || { userRatings: {} });

  const authUser = useSelector((state) => state.auth?.user) || (() => {
    try {
      const u = localStorage.getItem('user') || localStorage.getItem('userdata');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isNormalUser = (authUser?.role || 'USER').trim().toUpperCase() === 'USER';

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Rating Modal state
  const [activeRatingModal, setActiveRatingModal] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);

  useEffect(() => {
    dispatch(fetchStores());
    if (isNormalUser) {
      dispatch(fetchUserRatings());
    }
  }, [dispatch, isNormalUser]);

  // Dynamic stores list directly from http://localhost:3000/api/stores
  const stores = Array.isArray(reduxStores) ? reduxStores : [];

  // Calculate real dynamic rating statistics from API stores data
  const totalStores = stores.length;
  const storesWithRatings = stores.filter((st) => {
    const r = parseFloat(st.average_rating || st.rating || 0);
    return r > 0;
  });

  const averageRatingScore =
    storesWithRatings.length > 0
      ? (
          storesWithRatings.reduce(
            (sum, st) => sum + parseFloat(st.average_rating || st.rating || 0),
            0
          ) / storesWithRatings.length
        ).toFixed(2)
      : '0.00';

  // Dynamic star breakdown based on real API response
  const breakdown = [5, 4, 3, 2, 1, 0].map((star) => {
    const count = stores.filter((st) => {
      const r = Math.round(parseFloat(st.average_rating || st.rating || 0));
      return r === star;
    }).length;
    const percentage = totalStores > 0 ? Math.round((count / totalStores) * 100) : 0;
    return { star, count, percentage };
  });

  // Filter stores by selected rating and search query
  const filteredStores = stores.filter((st) => {
    const r = parseFloat(st.average_rating || st.rating || 0);
    const starFloor = Math.round(r);

    let matchesRating = true;
    if (selectedFilter === 'rated') {
      matchesRating = r > 0;
    } else if (selectedFilter === 'unrated') {
      matchesRating = r === 0;
    } else if (selectedFilter !== 'all') {
      matchesRating = starFloor === Number(selectedFilter);
    }

    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.address && st.address.toLowerCase().includes(q)) ||
      (st.owner_name && st.owner_name.toLowerCase().includes(q));

    return matchesRating && matchesSearch;
  });

  // Open modal for submit or modify
  const handleOpenRatingModal = (store, isModifying, currentRating, ratingId) => {
    dispatch(clearRatingStatus());
    const initialStars = currentRating ? Number(currentRating) : 5;
    setSelectedStars(initialStars);
    setHoveredStars(0);
    setActiveRatingModal({
      store,
      isModifying,
      currentRating: initialStars,
      ratingId: ratingId || userRatings[store.id]?.id || 15,
    });
  };

  // Save rating via Redux ratingSlice
  const handleSaveRating = async (e) => {
    e.preventDefault();
    if (!activeRatingModal) return;

    const { store, isModifying, ratingId } = activeRatingModal;
    const starsToSubmit = Number(selectedStars);

    if (starsToSubmit < 1 || starsToSubmit > 5) return;

    if (isModifying) {
      const res = await dispatch(
        updateRating({
          ratingId: ratingId || userRatings[store.id]?.id || 15,
          store_id: store.id,
          rating: starsToSubmit,
        })
      );
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchStores());
        setTimeout(() => {
          setActiveRatingModal(null);
          dispatch(clearRatingStatus());
        }, 1200);
      }
    } else {
      const res = await dispatch(
        submitRating({
          store_id: store.id,
          rating: starsToSubmit,
        })
      );
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchStores());
        setTimeout(() => {
          setActiveRatingModal(null);
          dispatch(clearRatingStatus());
        }, 1200);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Store Ratings & Metrics</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Live ratings fetched directly from <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs">http://localhost:3000/api/stores</code>
          </p>
        </div>

        <button
          onClick={() => {
            dispatch(fetchStores());
            if (isNormalUser) dispatch(fetchUserRatings());
          }}
          disabled={isLoadingStores}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh store ratings from API"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingStores ? 'animate-spin text-amber-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Global Feedback Toast */}
      {ratingSuccess && !activeRatingModal && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{ratingSuccess}</span>
          </div>
          <button
            onClick={() => dispatch(clearRatingStatus())}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Dynamic Rating Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Overall Platform Average Score */}
        <div className="text-center md:border-r border-slate-200/80 md:pr-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Platform Average Rating
          </span>
          <div className="text-5xl font-black text-slate-900 mb-2">
            {averageRatingScore}
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRatingScore))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Computed from <strong>{totalStores}</strong> live stores ({storesWithRatings.length} rated)
          </p>
        </div>

        {/* Right: Dynamic Rating Breakdown */}
        <div className="md:col-span-2 space-y-2">
          {breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs">
              <span className="w-16 font-semibold text-slate-700 flex items-center gap-1">
                {row.star > 0 ? (
                  <>
                    <span>{row.star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </>
                ) : (
                  <span className="text-slate-400">0 ★ Unrated</span>
                )}
              </span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.star > 0
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
              <span className="w-12 text-slate-400 text-right">{row.percentage}%</span>
              <span className="w-16 text-slate-600 text-right font-medium">
                {row.count} store{row.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store name, address, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Stores' },
            { id: '5', label: '5 ★' },
            { id: '4', label: '4 ★' },
            { id: '3', label: '3 ★' },
            { id: '2', label: '2 ★' },
            { id: '1', label: '1 ★' },
            { id: 'unrated', label: 'Unrated (0 ★)' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setSelectedFilter(flt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === flt.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Dynamic Stores Rating Cards */}
      <div className="space-y-4">
        {isLoadingStores && stores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Loading stores from API...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800 mb-1">No Stores Found</h4>
            <p className="text-xs text-slate-500">
              No stores match your current filter or search criteria.
            </p>
          </div>
        ) : (
          filteredStores.map((store) => {
            const avgRatingNum = parseFloat(store.average_rating || store.rating || 0);
            const isStoreRated = avgRatingNum > 0;

            // Normal user submitted rating
            const userRatingObj = userRatings[store.id];
            const hasUserRated = !!userRatingObj?.rating;
            const userSubmittedRating = userRatingObj ? Number(userRatingObj.rating) : null;
            const ratingRecordId = userRatingObj?.id || 15;

            // Format creation date
            const createdDate = store.created_at
              ? new Date(store.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Store Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      #{store.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{store.name}</h3>

                    {/* Dynamic Average Rating Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isStoreRated
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isStoreRated ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                      <span>
                        {isStoreRated
                          ? `${avgRatingNum.toFixed(2)} / 5.00`
                          : '0.00 / 5.00 (Unrated)'}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>

                    {store.owner_name && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Owner: {store.owner_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Added: {createdDate}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Visual & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                  {/* Stars Visual */}
                  <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(avgRatingNum)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      average_rating: <code className="font-bold text-slate-700">{store.average_rating || '0.00'}</code>
                    </span>
                  </div>

                  {/* Normal User Rating Controls */}
                  {isNormalUser && (
                    <div className="flex items-center gap-2">
                      {hasUserRated ? (
                        <button
                          onClick={() =>
                            handleOpenRatingModal(
                              store,
                              true,
                              userSubmittedRating,
                              ratingRecordId
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Modify (You: {userSubmittedRating}★)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenRatingModal(store, false, null, null)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Submit Rating</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Rating Modal (Submit / Modify 1 to 5 Stars) */}
      {activeRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            <button
              onClick={() => {
                setActiveRatingModal(null);
                dispatch(clearRatingStatus());
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeRatingModal.isModifying
                    ? 'Modify Store Rating'
                    : 'Submit Store Rating'}
                </h3>
                <p className="text-xs text-slate-500">
                  Rate {activeRatingModal.store.name} between 1 and 5 stars
                </p>
              </div>
            </div>

            {/* Store Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
              <p className="font-bold text-sm text-slate-900">{activeRatingModal.store.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activeRatingModal.store.address}</span>
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-500">Store Average:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {activeRatingModal.store.average_rating || '0.00'} / 5.00
                </span>
              </div>
            </div>

            {/* Alerts */}
            {ratingError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ratingError}</span>
              </div>
            )}

            {ratingSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ratingSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveRating} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Select Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
                </label>

                <div className="flex items-center justify-center gap-2 py-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit =
                      hoveredStars > 0 ? star <= hoveredStars : star <= selectedStars;

                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoveredStars(star)}
                        onMouseLeave={() => setHoveredStars(0)}
                        onClick={() => setSelectedStars(star)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isLit
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 text-center">
                  <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100/70 border border-amber-200/80 px-3 py-1 rounded-full">
                    {selectedStars === 5
                      ? '5 - Excellent'
                      : selectedStars === 4
                      ? '4 - Very Good'
                      : selectedStars === 3
                      ? '3 - Good'
                      : selectedStars === 2
                      ? '2 - Fair'
                      : '1 - Poor'}
                  </span>
                </div>
              </div>

              {activeRatingModal.isModifying && (
                <div className="text-center text-xs text-slate-500">
                  <span>Current: <strong>{activeRatingModal.currentRating}★</strong></span>
                  {selectedStars !== activeRatingModal.currentRating && (
                    <span className="text-indigo-600 font-semibold ml-1.5">
                      → Updating to {selectedStars}★
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRatingModal(null);
                    dispatch(clearRatingStatus());
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRatingSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-sm font-semibold text-white shadow-md shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isRatingSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : activeRatingModal.isModifying ? (
                    <span>Update Rating</span>
                  ) : (
                    <span>Submit Rating</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
