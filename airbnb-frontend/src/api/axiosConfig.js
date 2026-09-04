import axios from 'axios';

/**
 * axiosConfig.js — central axios instance for the Airbnb frontend.
 *
 * Uses an explicit base URL so API calls always reach the backend
 * on port 5000, regardless of which port the React dev server runs on.
 *
 * The REACT_APP_API_URL env variable lets you override this for
 * production without changing code — just set it in .env.production.
 */
const api = axios.create({
 baseURL: process.env.REACT_APP_API_URL || 'https://dido-capstone.onrender.com',
  withCredentials: true,
});

export default api;
