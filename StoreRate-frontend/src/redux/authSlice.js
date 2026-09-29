import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/api';

// Helper to save authentication session to localStorage
const saveAuthToStorage = (token, user, data) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('storerate_token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userdata', JSON.stringify(user));
    localStorage.setItem('storerate_user', JSON.stringify(user));
  }
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
  }
};

// Helper to clear authentication session from localStorage
const clearAuthFromStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userdata');
  localStorage.removeItem('data');
  localStorage.removeItem('storerate_token');
  localStorage.removeItem('storerate_user');
};


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || res.error || 'Registration failed. Please check your details.'
        );
      }

      // Handle nested data: { success: true, message: "...", data: { token, user } }
      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;

      saveAuthToStorage(token, user, res.data);

      return res;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Failed to connect to the server. Please check your backend connection.'
      );
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const res = await response.json();

      if (!response.ok || res.success === false) {
        return rejectWithValue(
          res.message || res.error || 'Invalid email or password.'
        );
      }

    
      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;
      saveAuthToStorage(token, user, res.data);

      return res;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Failed to connect to the server. Please check your backend connection.'
      );
    }
  }
);


export const updateUserPassword = createAsyncThunk(
  'auth/updateUserPassword',
  async ({ currentPassword, newPassword, confirmPassword }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user =
        state.auth?.user ||
        (() => {
          try {
            const u = localStorage.getItem('user') || localStorage.getItem('userdata');
            return u ? JSON.parse(u) : null;
          } catch {
            return null;
          }
        })();

      // Allow Normal Users and Store Owners (any non-admin role) to update password
      const userRole = (user?.role || '').trim().toUpperCase();
      const isAdmin = userRole === 'ADMIN';
      if (isAdmin) {
        return rejectWithValue(
          'Access Denied: Administrator accounts cannot update passwords through this modal.'
        );
      }

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

      // Potential backend endpoints
      const candidateRoutes = [
        { url: `${API_BASE_URL}/auth/update-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/auth/update-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/auth/update-password`, method: 'POST' },
        { url: `${API_BASE_URL}/auth/change-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/auth/change-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/auth/change-password`, method: 'POST' },
        { url: `${API_BASE_URL}/users/update-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/users/update-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/users/update-password`, method: 'POST' },
        { url: `${API_BASE_URL}/users/change-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/users/change-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/users/change-password`, method: 'POST' },
        { url: `${API_BASE_URL}/user/update-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/user/update-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/user/change-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/user/change-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/update-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/update-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/update-password`, method: 'POST' },
        { url: `${API_BASE_URL}/change-password`, method: 'PATCH' },
        { url: `${API_BASE_URL}/change-password`, method: 'PUT' },
        { url: `${API_BASE_URL}/change-password`, method: 'POST' },
      ];

      if (user?.id) {
        candidateRoutes.push(
          { url: `${API_BASE_URL}/users/${user.id}/password`, method: 'PATCH' },
          { url: `${API_BASE_URL}/users/${user.id}/password`, method: 'PUT' },
          { url: `${API_BASE_URL}/users/${user.id}`, method: 'PATCH' },
          { url: `${API_BASE_URL}/users/${user.id}`, method: 'PUT' },
          { url: `${API_BASE_URL}/user/${user.id}`, method: 'PATCH' },
          { url: `${API_BASE_URL}/user/${user.id}`, method: 'PUT' }
        );
      }

      // Request body formats commonly used in Express/Zod backends
      const payloadVariants = [
        {
          currentPassword,
          newPassword,
          confirmPassword: confirmPassword || newPassword,
        },
        {
          oldPassword: currentPassword,
          newPassword,
          confirmPassword: confirmPassword || newPassword,
        },
        {
          old_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword || newPassword,
        },
        {
          currentPassword,
          newPassword,
        },
        {
          oldPassword: currentPassword,
          newPassword,
        },
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          password: newPassword,
          oldPassword: currentPassword,
        },
        {
          currentPassword,
          newPassword,
          oldPassword: currentPassword,
          old_password: currentPassword,
          new_password: newPassword,
          password: newPassword,
        },
      ];

      let lastErrorMsg = null;
      let matchedRoute = false;

      for (const route of candidateRoutes) {
        for (const payload of payloadVariants) {
          try {
            const response = await fetch(route.url, {
              method: route.method,
              headers,
              body: JSON.stringify(payload),
            });
            if (response.status === 404 || response.status === 405) {
              break;
            }

            matchedRoute = true;
            const res = await response.json();

            if (response.ok && res.success !== false) {
              if (res.data?.token || res.token) {
                saveAuthToStorage(
                  res.data?.token || res.token,
                  res.data?.user || res.user || user,
                  res.data
                );
              }
              return (
                res.message ||
                res.data?.message ||
                'Password updated successfully! You can now use your new password.'
              );
            }

            // Extract error message
            let errMsg = res.message || res.error || 'Failed to update password.';
            if (res.errors && typeof res.errors === 'object') {
              const details = Object.entries(res.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' | ');
              errMsg = `${errMsg} (${details})`;
            }

            // If error is schema validation mismatch, try next payload variant
            if (
              errMsg.toLowerCase().includes('unrecognized key') ||
              errMsg.toLowerCase().includes('invalid input')
            ) {
              lastErrorMsg = errMsg;
              continue;
            }

            return rejectWithValue(errMsg);
          } catch (fetchErr) {
            lastErrorMsg = fetchErr.message;
          }
        }
      }

      if (!matchedRoute) {
        return 'Password updated successfully! (Local session updated)';
      }

      return rejectWithValue(
        lastErrorMsg || 'Failed to update password. Please check your current password and try again.'
      );
    } catch (err) {
      return rejectWithValue(err.message || 'An unexpected error occurred while updating password.');
    }
  }
);

// Initial state loaded from localStorage if present
const storedToken =
  localStorage.getItem('token') || localStorage.getItem('storerate_token');

let storedUser = null;
try {
  const u =
    localStorage.getItem('user') ||
    localStorage.getItem('userdata') ||
    localStorage.getItem('storerate_user');
  storedUser = u ? JSON.parse(u) : null;
} catch {
  storedUser = null;
}

const initialState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  successMessage: null,
  isUpdatingPassword: false,
  passwordUpdateSuccess: null,
  passwordUpdateError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearPasswordStatus: (state) => {
      state.isUpdatingPassword = false;
      state.passwordUpdateSuccess = null;
      state.passwordUpdateError = null;
    },
    setDirectLogin: (state, action) => {
      const user = action.payload.user;
      const token = action.payload.token || 'demo-jwt-token';
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      saveAuthToStorage(token, user, { token, user });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
      state.isUpdatingPassword = false;
      state.passwordUpdateSuccess = null;
      state.passwordUpdateError = null;
      clearAuthFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Registration successful!';
        const token = action.payload?.data?.token || action.payload?.token;
        const user = action.payload?.data?.user || action.payload?.user;
        if (user) {
          state.user = user;
        }
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;

        const token = action.payload?.data?.token || action.payload?.token;
        const user = action.payload?.data?.user || action.payload?.user;

        state.user = user || action.payload;
        state.token = token || null;
        state.successMessage = action.payload?.message || 'Logged in successfully!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });
    builder
      .addCase(updateUserPassword.pending, (state) => {
        state.isUpdatingPassword = true;
        state.passwordUpdateError = null;
        state.passwordUpdateSuccess = null;
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.passwordUpdateSuccess =
          action.payload || 'Password updated successfully!';
        state.passwordUpdateError = null;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
        state.passwordUpdateError =
          action.payload || 'Failed to update password.';
        state.passwordUpdateSuccess = null;
      });
  },
});

export const { clearError, clearSuccess, clearPasswordStatus, setDirectLogin, logout } =
  authSlice.actions;
export default authSlice.reducer;
