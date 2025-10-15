import API from './api';

const userService = {
  // Get all users (Admin)
  getAllUsers: async (params = {}) => {
    const response = await API.get('/users', { params });
    return response.data;
  },

  // Get user by ID (Admin)
  getUserById: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin)
  updateUser: async (id, userData) => {
    const response = await API.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin)
  deleteUser: async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (Admin)
  getUserStats: async () => {
    const response = await API.get('/users/stats');
    return response.data;
  },

  // Block/Unblock user (Admin)
  toggleUserStatus: async (id) => {
    const response = await API.patch(`/users/${id}/toggle-status`);
    return response.data;
  }
};

export default userService;