import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import adminReducer from './adminSlice';
import ratingReducer from './ratingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
    ratings: ratingReducer,
  },
});

export default store;
