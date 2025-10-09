// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api'; // <-- use the centralized axios instance (points to :5000 + injects token)

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only manage localStorage; the API interceptor will read from it and set x-auth-token
  const setAuthToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/api/auth');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user', err);
      setUser(null);
      setAuthToken(null); // purge bad/expired token
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const register = async (formData) => {
    try {
      const res = await API.post('/api/auth/register', formData);
      setAuthToken(res.data.token);
      await loadUser();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const login = async (formData) => {
    try {
      const res = await API.post('/api/auth/login', formData);
      setAuthToken(res.data.token);
      await loadUser();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (formData) => {
    try {
      await API.put('/api/auth/update', formData);
      await loadUser();
    } catch (err) {
      console.error('Failed to update user', err);
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
