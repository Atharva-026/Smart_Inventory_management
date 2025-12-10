import API from './api';

const authService = {
  // Register new student (with invitation code)
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Register faculty (Admin only)
  registerFaculty: async (facultyData) => {
    const response = await API.post('/auth/register-faculty', facultyData);
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
  },

  // Get my students (Faculty only)
  getMyStudents: async () => {
    const response = await API.get('/auth/my-students');
    return response.data;
  }
};

export default authService;