import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

// 1. Async Thunk: Fetch Admin Dashboard Statistics
// Target endpoint: http://localhost:3000/api/dashboard
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
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

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers,
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || 'Failed to fetch dashboard metrics from server.'
        );
      }

      // Return { total_users, total_stores, total_ratings }
      return res.data || { total_users: 0, total_stores: 0, total_ratings: 0 };
    } catch (err) {
      return rejectWithValue(
        err.message || 'Network error while connecting to dashboard API.'
      );
    }
  }
);

// 2. Async Thunk: Fetch Store Owner Dashboard
// Target endpoint: http://localhost:3000/api/dashboard/owner
// Response format:
// {
//     "success": true,
//     "message": "Owner dashboard fetched successfully",
//     "data": {
//         "store": { "id": 17, "name": "Bigmart Super Market" },
//         "average_rating": "5.00",
//         "users": [
//             { "user_id": 29, "user_name": "Shweta Pandit User", "email": "...", "rating": 5, "created_at": "..." },
//             { "user_id": 22, "user_name": "Raj Tabhekar", "email": "...", "rating": 5, "created_at": "..." }
//         ]
//     }
// }
export const fetchOwnerDashboard = createAsyncThunk(
  'dashboard/fetchOwnerDashboard',
  async (_, { getState, rejectWithValue }) => {
    try {
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

      const response = await fetch(`${API_BASE_URL}/dashboard/owner`, {
        method: 'GET',
        headers,
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || 'Failed to fetch store owner dashboard.'
        );
      }

      return (
        res.data || {
          store: null,
          average_rating: '0.00',
          users: [],
        }
      );
    } catch (err) {
      return rejectWithValue(
        err.message || 'Network error while connecting to owner dashboard API.'
      );
    }
  }
);

const initialState = {
  // Admin dashboard metrics
  stats: {
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
  },
  // Store Owner dashboard metrics
  ownerData: {
    store: null,
    average_rating: '0.00',
    users: [],
  },
  isLoading: false,
  isLoadingOwner: false,
  error: null,
  ownerError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
      state.ownerError = null;
    },
    resetDashboard: (state) => {
      state.stats = { total_users: 0, total_stores: 0, total_ratings: 0 };
      state.ownerData = { store: null, average_rating: '0.00', users: [] };
      state.isLoading = false;
      state.isLoadingOwner = false;
      state.error = null;
      state.ownerError = null;
    },
  },
  extraReducers: (builder) => {
    // Admin Dashboard
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = {
          total_users: action.payload?.total_users ?? 0,
          total_stores: action.payload?.total_stores ?? 0,
          total_ratings: action.payload?.total_ratings ?? 0,
        };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load dashboard statistics';
      });

    // Store Owner Dashboard (http://localhost:3000/api/dashboard/owner)
    builder
      .addCase(fetchOwnerDashboard.pending, (state) => {
        state.isLoadingOwner = true;
        state.ownerError = null;
      })
      .addCase(fetchOwnerDashboard.fulfilled, (state, action) => {
        state.isLoadingOwner = false;
        state.ownerData = {
          store: action.payload?.store || null,
          average_rating: action.payload?.average_rating || '0.00',
          users: Array.isArray(action.payload?.users) ? action.payload.users : [],
        };
      })
      .addCase(fetchOwnerDashboard.rejected, (state, action) => {
        state.isLoadingOwner = false;
        state.ownerError = action.payload || 'Failed to load owner dashboard';
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
