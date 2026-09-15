
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';

/**
 * AuthContext — global authentication state for the Admin Dashboard.
 * Stores the logged-in user and JWT token in localStorage for session persistence.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  /**
   * login — POST credentials to backend.
   *
   * Only users with the admin role can log into
   * the Admin Dashboard.
   */
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/users/login', {
        email,
        password
      });

      // Only admins can access the Admin Dashboard
      if (data.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied. Admin account required.'
        };
      }

      // Store authenticated admin
      setUser(data);
      setToken(data.token);

      localStorage.setItem(
        'adminUser',
        JSON.stringify(data)
      );

      localStorage.setItem(
        'adminToken',
        data.token
      );

      api.defaults.headers.common['Authorization'] =
        `Bearer ${data.token}`;

      return { success: true };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed. Please try again.';

      return {
        success: false,
        message
      };
    }
  };

  /**
   * logout — clear all admin session data.
   */
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');

    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for consuming auth context.
 */
export const useAuth = () => useContext(AuthContext);

