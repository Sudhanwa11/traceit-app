import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const setAuthToken = useCallback((token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
        }
    }, []);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                const res = await axios.get('/api/auth');
                setUser(res.data);
            } catch (err) {
                console.error('Failed to load user', err);
                setUser(null);
                setAuthToken(null);
            }
        }
        setLoading(false);
    }, [setAuthToken]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const register = async (formData) => {
        try {
            const res = await axios.post('/api/auth/register', formData);
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
            const res = await axios.post('/api/auth/login', formData);
            setAuthToken(res.data.token);
            await loadUser();
            setError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.msg || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    
    const logout = () => {
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};