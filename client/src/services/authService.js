// client/src/services/authService.js
import axios from 'axios';

const updateProfile = async (userData) => {
    const response = await axios.put('/api/auth/update', userData);
    return response.data;
};

const viewSensitiveData = async (passwordData) => {
    const response = await axios.post('/api/auth/view-sensitive', passwordData);
    return response.data;
};

const updateAadhaar = async (data) => {
    const response = await axios.put('/api/auth/update-sensitive', data);
    return response.data;
};

const authService = {
    updateProfile,
    viewSensitiveData,
    updateAadhaar,
};

export default authService;