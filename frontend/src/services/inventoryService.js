import API from './api';

const inventoryService = {
  // Get all items
  getAllItems: async (params = {}) => {
    const response = await API.get('/inventory', { params });
    return response.data;
  },

  // Get single item by ID
  getItemById: async (id) => {
    const response = await API.get(`/inventory/${id}`);
    return response.data;
  },

  // Get item by QR code / identifier
  getItemByQR: async (qrData) => {
    // encode to avoid characters breaking the URL
    const encoded = encodeURIComponent(qrData);
    try {
      const response = await API.get(`/inventory/qr/${encoded}`);
      return response.data;
    } catch (err) {
      // rethrow with status for caller to inspect
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      const error = new Error(message);
      error.status = status;
      throw error;
    }
  },

  // Create new item (Admin)
  createItem: async (itemData) => {
    const response = await API.post('/inventory', itemData);
    return response.data;
  },

  // Update item (Admin)
  updateItem: async (id, itemData) => {
    const response = await API.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  // Delete item (Admin)
  deleteItem: async (id) => {
    const response = await API.delete(`/inventory/${id}`);
    return response.data;
  },

  // Get available items
  getAvailableItems: async () => {
    const response = await API.get('/inventory?status=available');
    return response.data;
  },

  // Search items
  searchItems: async (query) => {
    const response = await API.get(`/inventory/search?q=${query}`);
    return response.data;
  }
};

export default inventoryService;