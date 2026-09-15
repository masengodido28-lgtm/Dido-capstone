import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for authentication to load
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT an admin
  if (user.role !== 'admin') {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <h2>Access Denied</h2>
        <p>You do not have permission to access the Admin Dashboard.</p>
      </div>
    );
  }

  // User is an admin
  return children;
};

export default PrivateRoute;