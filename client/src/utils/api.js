// client/src/api.js
import axios from 'axios';

// Create a new instance of axios
const API = axios.create({
    // Use the production URL if it exists, otherwise default to localhost for development
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// This is an interceptor. It runs before every request.
// It checks if a token exists in local storage and adds it to the headers.
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers['x-auth-token'] = token;
    }
    return req;
});

export default API;