import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/api';

// Helper to get auth headers with Bearer token
const getAuthHeaders = (getState) => {
  const state = getState();
  const token =
    state.auth?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('storerate_token');

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to get saved user ratings from localStorage
const getSavedUserRatings = () => {
  try {
    const userStr =
      localStorage.getItem('user') ||
      localStorage.getItem('userdata') ||
      localStorage.getItem('storerate_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || user?.email || 'current';
    const saved = localStorage.getItem(`storerate_user_ratings_${userId}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Helper to persist user ratings to localStorage
const saveUserRatingsToStorage = (userRatings, state) => {
  try {
    const user =
      state?.auth?.user ||
      (() => {
        try {
          const u = localStorage.getItem('user') || localStorage.getItem('userdata');
          return u ? JSON.parse(u) : null;
        } catch {
          return null;
        }
      })();
    const userId = user?.id || user?.email || 'current';
    localStorage.setItem(`storerate_user_ratings_${userId}`, JSON.stringify(userRatings));
  } catch {

  }
};
export const submitRating = createAsyncThunk(
  'ratings/submitRating',
  async ({ store_id, rating }, { getState, rejectWithValue }) => {
    try {
      const payload = {
        store_id: Number(store_id),
        rating: Number(rating),
      };

      const response = await fetch(`${API_BASE_URL}/rating`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        let errMsg = res.message || res.error || 'Failed to submit rating.';
        if (res.errors && typeof res.errors === 'object') {
          const detail = Object.entries(res.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          errMsg = `${errMsg} (${detail})`;
        }
        return rejectWithValue(errMsg);
      }

      const ratingData = res.data || res.rating || res;
      return {
        store_id: Number(store_id),
        rating: Number(rating),
        id: ratingData?.id || ratingData?.rating_id || Date.now(),
        message: res.message || 'Rating submitted successfully!',
        ...ratingData,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Error connecting to rating API.');
    }
  }
);

export const updateRating = createAsyncThunk(
  'ratings/updateRating',
  async ({ ratingId, store_id, rating }, { getState, rejectWithValue }) => {
    try {
      const payload = {
        rating: Number(rating),
      };

      const response = await fetch(`${API_BASE_URL}/rating/${ratingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        let errMsg = res.message || res.error || 'Failed to update rating.';
        if (res.errors && typeof res.errors === 'object') {
          const detail = Object.entries(res.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          errMsg = `${errMsg} (${detail})`;
        }
        return rejectWithValue(errMsg);
      }

      const ratingData = res.data || res.rating || res;
      return {
        store_id: Number(store_id),
        rating: Number(rating),
        id: ratingId,
        message: res.message || 'Rating updated successfully!',
        ...ratingData,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Error connecting to update rating API.');
    }
  }
);

export const fetchUserRatings = createAsyncThunk(
  'ratings/fetchUserRatings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rating`, {
        method: 'GET',
        headers: getAuthHeaders(getState),
      });

      if (!response.ok) {
        const fallbackRes = await fetch(`${API_BASE_URL}/ratings`, {
          method: 'GET',
          headers: getAuthHeaders(getState),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const list = fallbackData.data || fallbackData.ratings || fallbackData;
          return Array.isArray(list) ? list : [];
        }
        return [];
      }

      const res = await response.json();
      const list = res.data || res.ratings || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching ratings.');
    }
  }
);

const initialState = {
  ratingsList: [],
  userRatings: getSavedUserRatings(), 
  isSubmitting: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

const ratingSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    clearRatingStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setUserRatingLocal: (state, action) => {
      const { store_id, rating, id } = action.payload;
      state.userRatings[store_id] = {
        store_id: Number(store_id),
        rating: Number(rating),
        id: id || Date.now(),
      };
    },
    resetUserRatings: (state) => {
      state.ratingsList = [];
      state.userRatings = {};
      state.isSubmitting = false;
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRating.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = action.payload.message || 'Rating submitted successfully!';
        const storeId = action.payload.store_id;
        state.userRatings[storeId] = action.payload;
        saveUserRatingsToStorage(state.userRatings);
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to submit rating';
      });
    builder
      .addCase(updateRating.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = action.payload.message || 'Rating updated successfully!';
        const storeId = action.payload.store_id;
        state.userRatings[storeId] = {
          ...state.userRatings[storeId],
          ...action.payload,
        };
        saveUserRatingsToStorage(state.userRatings);
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to update rating';
      });
    builder
      .addCase(fetchUserRatings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratingsList = action.payload;
        if (Array.isArray(action.payload)) {
          action.payload.forEach((item) => {
            if (item.store_id && item.rating) {
              state.userRatings[item.store_id] = {
                id: item.id || item.rating_id,
                store_id: item.store_id,
                rating: Number(item.rating),
              };
            }
          });
          saveUserRatingsToStorage(state.userRatings);
        }
      })
      .addCase(fetchUserRatings.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearRatingStatus, setUserRatingLocal, resetUserRatings } =
  ratingSlice.actions;

export default ratingSlice.reducer;
