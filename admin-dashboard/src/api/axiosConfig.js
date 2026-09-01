import axios from 'axios';

/**
 * axiosConfig.js — central axios instance for the Admin Dashboard.
 *
 * Explicit base URL so calls always reach the backend on port 5000,
 * regardless of whether the admin dashboard runs on 3000 or 3001.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

export default api;
