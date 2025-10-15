import API from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  }
};

export default authService;