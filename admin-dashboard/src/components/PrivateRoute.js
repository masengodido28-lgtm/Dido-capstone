
import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — protects Admin Dashboard pages.
 *
 * Rules:
 * 1. Wait while authentication is loading.
 * 2. If there is no logged-in user, redirect to /login.
 * 3. If the user is not an admin, redirect to /.
 * 4. Only users with role === 'admin' can access the page.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for authentication state to load
  if (loading) {
    return null;
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but is not an admin
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // User is an admin
  return children;
};

export default PrivateRoute;

