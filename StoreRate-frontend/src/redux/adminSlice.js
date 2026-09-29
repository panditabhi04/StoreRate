import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/api';

// Helper to get auth headers
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

export const addStore = createAsyncThunk(
  'admin/addStore',
  async (storeData, { getState, rejectWithValue }) => {
    try {
      const payload = {
        name: storeData.name?.trim(),
        email: storeData.email?.trim(),
        address: storeData.address?.trim(),
        owner_id: Number(storeData.owner_id),
      };

      const response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        let errMsg = res.message || res.error || 'Failed to add store.';
        if (res.errors && typeof res.errors === 'object') {
          const detail = Object.entries(res.errors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
            )
            .join(' | ');
          errMsg = `${errMsg} (${detail})`;
        }
        return rejectWithValue(errMsg);
      }

      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message || 'Error connecting to Stores API.');
    }
  }
);

export const addNormalUser = createAsyncThunk(
  'admin/addNormalUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        address: userData.address.trim(),
        password: userData.password,
        role: 'USER',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || res.error || 'Failed to add normal user.'
        );
      }

      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message || 'Error connecting to Auth API.');
    }
  }
);

export const addAdminUser = createAsyncThunk(
  'admin/addAdminUser',
  async (adminData, { getState, rejectWithValue }) => {
    try {
      const payload = {
        name: adminData.name.trim(),
        email: adminData.email.trim(),
        password: adminData.password,
        address: adminData.address.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || res.error || 'Failed to add admin user.'
        );
      }

      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message || 'Error connecting to Admin API.');
    }
  }
);

export const fetchStores = createAsyncThunk(
  'admin/fetchStores',
  async (_, { getState, rejectWithValue }) => {
    try {
      let response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'GET',
        headers: getAuthHeaders(getState),
      });

      // If auth token caused an issue or expired, retry without Bearer header (public access)
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        response = await fetch(`${API_BASE_URL}/stores`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(res.message || 'Failed to fetch stores.');
      }

      // Handle data array or wrapper
      const list = res.data || res.stores || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching stores list.');
    }
  }
);


export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/new-user`, {
        method: 'GET',
        headers: getAuthHeaders(getState),
      });

      if (!response.ok) {
        // Fallback to /admin/users or /users if needed
        const fallbackRes = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'GET',
          headers: getAuthHeaders(getState),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const list = fallbackData.data || fallbackData.users || fallbackData;
          return Array.isArray(list) ? list : [];
        }
        return [];
      }

      const res = await response.json();
      const list = res.data || res.users || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching users from /new-user.');
    }
  }
);


export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: 'GET',
        headers: getAuthHeaders(getState),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || res.error || 'Failed to fetch admin users.'
        );
      }

      // Handle res.data, res.admins, res.adminUsers, res.users, or direct array
      const list =
        res.data?.admins ||
        res.data?.adminUsers ||
        res.data?.users ||
        res.data ||
        res.admins ||
        res.adminUsers ||
        res.users ||
        (Array.isArray(res) ? res : []);

      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching admin users.');
    }
  }
);

const initialState = {
  stores: [],
  users: [],
  adminUsers: [],
  isLoadingStores: false,
  isLoadingUsers: false,
  isLoadingAdminUsers: false,
  isSubmitting: false,
  successMessage: null,
  error: null,
  adminUsersError: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminStatus: (state) => {
      state.successMessage = null;
      state.error = null;
      state.adminUsersError = null;
    },
  },
  extraReducers: (builder) => {
    // Add Store
    builder
      .addCase(addStore.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addStore.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = 'Store created successfully!';
        if (action.payload) {
          state.stores.unshift(action.payload);
        }
      })
      .addCase(addStore.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to add store';
      });

    // Add Normal User
    builder
      .addCase(addNormalUser.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addNormalUser.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = 'Normal user created successfully!';
        if (action.payload) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(addNormalUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to add normal user';
      });

   
    builder
      .addCase(addAdminUser.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addAdminUser.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = 'Admin user created successfully!';
        const createdAdmin = action.payload?.admin || action.payload?.user || action.payload;
        if (createdAdmin && typeof createdAdmin === 'object') {
          state.adminUsers = [
            createdAdmin,
            ...state.adminUsers.filter(
              (a) => (a.id || a.email) !== (createdAdmin.id || createdAdmin.email)
            ),
          ];
          state.users.unshift(createdAdmin);
        }
      })
      .addCase(addAdminUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to add admin user';
      });

    // Fetch Stores
    builder
      .addCase(fetchStores.pending, (state) => {
        state.isLoadingStores = true;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoadingStores = false;
        state.stores = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStores.rejected, (state) => {
        state.isLoadingStores = false;
      });

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.users = action.payload;
        }
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.isLoadingUsers = false;
      });

    // Fetch Admin Users (GET /api/admin)
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoadingAdminUsers = true;
        state.adminUsersError = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoadingAdminUsers = false;
        state.adminUsers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoadingAdminUsers = false;
        state.adminUsersError = action.payload || 'Failed to load admin users';
      });
  },
});

export const { clearAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;
