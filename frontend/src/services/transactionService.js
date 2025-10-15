import API from './api';

const transactionService = {
  // Borrow item
  borrowItem: async (itemId) => {
    const response = await API.post('/transactions/borrow', { itemId });
    return response.data;
  },

  // Return item
  returnItem: async (transactionId) => {
    const response = await API.post(`/transactions/return/${transactionId}`);
    return response.data;
  },

  // Get user's transactions
  getMyTransactions: async () => {
    const response = await API.get('/transactions/my-transactions');
    return response.data;
  },

  // Get all transactions (Admin)
  getAllTransactions: async (params = {}) => {
    const response = await API.get('/transactions', { params });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    const response = await API.get(`/transactions/${id}`);
    return response.data;
  },

  // Get active borrowings
  getActiveBorrowings: async () => {
    const response = await API.get('/transactions/active');
    return response.data;
  },

  // Get overdue transactions
  getOverdueTransactions: async () => {
    const response = await API.get('/transactions/overdue');
    return response.data;
  }
};

export default transactionService;