import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores } from '../../redux/adminSlice';
import {
  submitRating,
  updateRating,
  fetchUserRatings,
  clearRatingStatus
} from '../../redux/ratingSlice';
import {
  Star,
  MapPin,
  Mail,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';

export default function StoresList({ onAddStore }) {
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

  const userRole = (authUser?.role || 'USER').trim().toUpperCase();
  const isNormalUser = userRole === 'USER';
  const isAdmin = userRole === 'ADMIN';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Rating Modal state
  const [activeRatingModal, setActiveRatingModal] = useState(null); // { store, isModifying, currentRating, ratingId }
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);


  useEffect(() => {
    dispatch(fetchStores());
    if (isNormalUser) {
      dispatch(fetchUserRatings());
    }
  }, [dispatch, isNormalUser]);

  // Dynamic stores list directly from http://localhost:3000/api/stores
  const allStores =
    Array.isArray(reduxStores) && reduxStores.length > 0
      ? reduxStores.map((st, i) => {
          // Parse dynamic average_rating (e.g. "0.00", "5.00")
          const avgRatingNum =
            st.average_rating !== undefined && st.average_rating !== null
              ? parseFloat(st.average_rating)
              : st.rating !== undefined && st.rating !== null
              ? parseFloat(st.rating)
              : 0;

          return {
            id: st.id || st._id || `store-${i}`,
            name: st.name || 'Unnamed Store',
            email: st.email || '',
            category: 'Store',
            rating: avgRatingNum.toFixed(2), // e.g. "0.00" or "5.00"
            raw_average_rating: st.average_rating || avgRatingNum.toFixed(2),
            owner_name: st.owner_name,
            owner_id: st.owner_id,
            address: st.address || 'Address not provided',
            isVerified: true,
            imageBg:
              avgRatingNum >= 4.5
                ? 'from-emerald-600 to-teal-700'
                : avgRatingNum > 0
                ? 'from-blue-600 to-indigo-700'
                : 'from-slate-700 to-slate-800',
            user_rating: st.user_rating || st.my_rating || null,
            rating_id: st.rating_id || null,
          };
        })
      : [];

  const filterOptions = ['All', '5 ★', '4 ★', '3 ★', '2 ★', '1 ★', 'Unrated (0 ★)'];

  const filteredStores = allStores.filter((st) => {
    const r = parseFloat(st.raw_average_rating || st.rating || 0);
    const starFloor = Math.round(r);

    let matchesRating = true;
    if (selectedCategory === '5 ★') matchesRating = starFloor === 5;
    else if (selectedCategory === '4 ★') matchesRating = starFloor === 4;
    else if (selectedCategory === '3 ★') matchesRating = starFloor === 3;
    else if (selectedCategory === '2 ★') matchesRating = starFloor === 2;
    else if (selectedCategory === '1 ★') matchesRating = starFloor === 1;
    else if (selectedCategory === 'Unrated (0 ★)') matchesRating = r === 0;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.email && st.email.toLowerCase().includes(q)) ||
      (st.address && st.address.toLowerCase().includes(q)) ||
      (st.owner_name && st.owner_name.toLowerCase().includes(q));

    return matchesRating && matchesSearch;
  });

  // Open modal to submit or modify rating
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

  // Submit or modify rating via Redux ratingSlice
  const handleSaveRating = async (e) => {
    e.preventDefault();
    if (!activeRatingModal) return;

    const { store, isModifying, ratingId } = activeRatingModal;
    const starsToSubmit = Number(selectedStars);

    if (starsToSubmit < 1 || starsToSubmit > 5) return;

    if (isModifying) {
      // Modify: PATCH http://localhost:3000/api/rating/:id with body { "rating": 4 }
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
      // Submit new: POST http://localhost:3000/api/rating with body { "store_id": 17, "rating": 5 }
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

  const getStarRatingLabel = (stars) => {
    switch (stars) {
      case 1:
        return '1 - Poor';
      case 2:
        return '2 - Fair';
      case 3:
        return '3 - Good';
      case 4:
        return '4 - Very Good';
      case 5:
        return '5 - Excellent';
      default:
        return `${stars} Stars`;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Stores Directory</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {isNormalUser
              ? 'Browse verified stores, view overall ratings, and submit or modify your personal store ratings (1 to 5 stars).'
              : 'Browse and manage commercial stores registered across the platform.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              dispatch(fetchStores());
              if (isNormalUser) dispatch(fetchUserRatings());
            }}
            disabled={isLoadingStores}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh stores directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStores ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Admin only action: Register New Store */}
          {isAdmin && onAddStore && (
            <button
              onClick={onAddStore}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Store</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Global Feedback Notifications */}
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

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores by name, email, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Store Listings Grid */}
      {isLoadingStores && filteredStores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Loading stores from API...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-base font-bold text-slate-800 mb-1">No Stores Available</p>
          <p className="text-xs text-slate-500">
            {search ? `No stores match "${search}".` : 'No stores returned from /api/stores.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((st) => {
            // Retrieve User's Submitted Rating for this store
            const userRatingObj =
              userRatings[st.id] ||
              (st.user_rating
                ? { rating: Number(st.user_rating), id: st.rating_id }
                : null);
            const hasUserRated = !!userRatingObj?.rating;
            const userSubmittedRating = userRatingObj ? Number(userRatingObj.rating) : null;
            const ratingRecordId = userRatingObj?.id || userRatingObj?.rating_id || 15;

            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col group justify-between"
              >
              {/* Card Banner Header */}
              <div>
                <div
                  className={`h-24 bg-gradient-to-r ${st.imageBg} p-4 flex items-start justify-between text-white relative`}
                >
                  <span className="px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-xs text-[11px] font-semibold tracking-wide border border-white/20">
                    Store #{st.id}
                  </span>

                  {st.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/90 text-white px-2 py-0.5 rounded-full shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Card Content Area */}
                <div className="p-5 space-y-3.5">
                  {/* ○ 1. Store Name & Overall Rating */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {st.name}
                      </h3>

                      {/* ○ 3. Overall Rating */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs shrink-0 ${
                          Number(st.rating) > 0
                            ? 'bg-amber-50 border-amber-200/80 text-amber-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                        title={`Store Overall Rating: ${st.raw_average_rating || st.rating}`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            Number(st.rating) > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                        <span>{st.raw_average_rating || st.rating} / 5.00</span>
                      </div>
                    </div>

                    {/* Email & Owner info */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </p>
                      {st.owner_name && (
                        <p className="flex items-center gap-1 text-slate-600 font-medium">
                          <span className="text-slate-400">Owner:</span>
                          <span className="truncate">{st.owner_name}</span>
                        </p>
                      )}
                    </div>

                    {/* ○ 2. Address */}
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug line-clamp-2">{st.address}</span>
                    </div>
                  </div>

                  {/* ================= NORMAL USER SPECIFIC CONTROLS ================= */}
                  {/* Per specification:
                      ○ User's Submitted Rating
                      ○ Option to submit a rating
                      ○ Option to modify their submitted rating
                      ● Can submit ratings (between 1 to 5) for individual stores */}
                  {isNormalUser && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      {/* ○ 4. User's Submitted Rating Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          Your Rating:
                        </span>

                        {hasUserRated ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <div className="flex items-center text-amber-400">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3 h-3 ${
                                    idx < userSubmittedRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span>{userSubmittedRating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md italic">
                            Not Rated Yet
                          </span>
                        )}
                      </div>

                      {/* ○ 5 & 6. Option to Submit / Modify Rating */}
                      <div className="pt-1">
                        {hasUserRated ? (
                          /* Option to Modify Submitted Rating */
                          <button
                            onClick={() =>
                              handleOpenRatingModal(st, true, userSubmittedRating, ratingRecordId)
                            }
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Modify Your Rating</span>
                          </button>
                        ) : (
                          /* Option to Submit New Rating */
                          <button
                            onClick={() => handleOpenRatingModal(st, false, null, null)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-xs shadow-amber-500/25 transition-all cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            <span>Submit a Rating</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer (Admin / Generic View) */}
              {!isNormalUser && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Store ID: #{st.id}</span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-1">
                    <span>Store Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

      {/* ================= MODAL: SUBMIT / MODIFY RATING (1 to 5 Stars) ================= */}
      {activeRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveRatingModal(null);
                dispatch(clearRatingStatus());
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeRatingModal.isModifying
                    ? 'Modify Submitted Rating'
                    : 'Submit Store Rating'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeRatingModal.isModifying
                    ? 'Update your rating between 1 and 5 stars'
                    : 'Rate this store from 1 to 5 stars'}
                </p>
              </div>
            </div>

            {/* Store Information Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
              <p className="font-bold text-sm text-slate-900">{activeRatingModal.store.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activeRatingModal.store.address}</span>
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-500">Overall Rating:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {activeRatingModal.store.rating} / 5
                </span>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {ratingError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ratingError}</span>
              </div>
            )}

            {ratingSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ratingSuccess}</span>
              </div>
            )}

            {/* Rating Form */}
            <form onSubmit={handleSaveRating} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Select Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
                </label>

                {/* 1 to 5 Interactive Stars Picker */}
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

                {/* Star Description Badge */}
                <div className="mt-2 text-center">
                  <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100/70 border border-amber-200/80 px-3 py-1 rounded-full">
                    {getStarRatingLabel(hoveredStars || selectedStars)}
                  </span>
                </div>
              </div>

              {/* Current Submitted Rating Hint if modifying */}
              {activeRatingModal.isModifying && (
                <div className="text-center text-xs text-slate-500">
                  <span>Current rating: </span>
                  <strong className="text-slate-800">
                    {activeRatingModal.currentRating} Stars
                  </strong>
                  {selectedStars !== activeRatingModal.currentRating && (
                    <span className="text-indigo-600 font-semibold ml-1.5">
                      → Changing to {selectedStars} Stars
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
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
                  disabled={isRatingSubmitting || !selectedStars}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-sm font-semibold text-white shadow-md shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
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
