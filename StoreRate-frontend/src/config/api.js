/**
 * Central API Configuration
 * Supports VITE_API_URL, VITE_API_BASE_URL, or falls back to 'http://localhost:3000/api'.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

export default API_BASE_URL;
