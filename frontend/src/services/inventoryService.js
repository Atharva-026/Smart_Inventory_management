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

  // Get item by QR code
  getItemByQR: async (qrCode) => {
    const response = await API.get(`/inventory/qr/${qrCode}`);
    return response.data;
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