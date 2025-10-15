export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  FACULTY: 'faculty'
};

export const ITEM_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged'
};

export const TRANSACTION_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue'
};

export const ITEM_CATEGORIES = [
  'Electronics',
  'Books',
  'Laboratory Equipment',
  'Sports Equipment',
  'Furniture',
  'Tools',
  'Other'
];

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    ITEM_CREATED: 'Item created successfully!',
    ITEM_UPDATED: 'Item updated successfully!',
    ITEM_DELETED: 'Item deleted successfully!',
    BORROW_SUCCESS: 'Item borrowed successfully!',
    RETURN_SUCCESS: 'Item returned successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!'
  },
  ERROR: {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    REGISTER_FAILED: 'Registration failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    ITEM_NOT_FOUND: 'Item not found.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
  }
};