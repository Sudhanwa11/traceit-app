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

// New: Change password API call
const changePassword = async ({ newPassword }) => {
  const response = await axios.put('/api/auth/change-password', { newPassword });
  return response.data;
};

// New: Delete account API call
const deleteAccount = async () => {
  const response = await axios.delete('/api/auth/delete-account');
  return response.data;
};

const authService = {
  updateProfile,
  viewSensitiveData,
  updateAadhaar,
  changePassword,    // added
  deleteAccount,     // added
};

export default authService;
