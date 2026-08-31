import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

/**
 * AuthContext for the Airbnb Frontend.
 * Handles user login/logout with JWT, persists session in localStorage.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('airbnbUser');
    const storedToken = localStorage.getItem('airbnbToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      setUser(data);
      localStorage.setItem('airbnbUser', JSON.stringify(data));
      localStorage.setItem('airbnbToken', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    }
  };

const register = async (username, email, password) => {
  try {
    const { data } = await axios.post('/api/users/register', {
      username,
      email,
      password
    });

    setUser(data);

    localStorage.setItem('airbnbUser', JSON.stringify(data));
    localStorage.setItem('airbnbToken', data.token);

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Registration failed.'
    };
  }
};  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('airbnbUser');
    localStorage.removeItem('airbnbToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
  <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
