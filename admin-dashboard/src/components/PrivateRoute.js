import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — wraps protected pages.
 * Redirects to /login if no authenticated user is present.
 * Shows nothing while the auth state is still loading from localStorage.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // avoid flash before rehydration completes

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
