import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug logging (remove in production)
      if (import.meta.env.DEV) {
        console.log('[API Request]', config.method?.toUpperCase(), config.url, 'with token');
      }
    } else {
      // Debug logging (remove in production)
      if (import.meta.env.DEV) {
        console.log('[API Request]', config.method?.toUpperCase(), config.url, 'without token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses (remove in production)
    if (import.meta.env.DEV) {
      console.log('[API Response]', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Debug logging for errors (remove in production)
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    }

    if (error.response?.status === 401) {
      const token = localStorage.getItem('admin_token');
      const isLoginPage = window.location.pathname === '/admin/login';
      const isLoginRequest = error.config?.url?.includes('/admin/login');
      
      // Only clear token and redirect if:
      // 1. We had a token (session expired)
      // 2. We're not on the login page
      // 3. This is not a login request (invalid credentials should show error, not redirect)
      if (token && !isLoginPage && !isLoginRequest) {
        console.warn('[Auth] Token expired or invalid, redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from axios error
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Unwrap response data
const unwrap = (response) => {
  // Backend returns: { success: true, data: {...} }
  // So we extract the data property
  if (response.data?.data) {
    return response.data.data;
  }
  // Fallback to direct data
  return response.data;
};

// Wrapper for API calls with error handling
const apiCall = async (requestFn) => {
  try {
    const response = await requestFn();
    return unwrap(response);
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
};

export const loginAdmin = async (credentials) => {
  return apiCall(() => api.post('/admin/login', credentials));
};

export const fetchAdminProfile = async () => {
  return apiCall(() => api.get('/admin/profile'));
};

export const fetchBookings = async () => {
  return apiCall(() => api.get('/admin/bookings'));
};

export const updateBookingStatus = async (bookingId, status) => {
  return apiCall(() => api.put(`/admin/update-status/${bookingId}`, { status }));
};

export const assignStaffToBooking = async (bookingId, staffId) => {
  return apiCall(() => api.put(`/admin/assign-staff/${bookingId}`, { staffId }));
};

export const fetchContacts = async () => {
  return apiCall(() => api.get('/admin/contacts'));
};

export const fetchStaff = async () => {
  return apiCall(() => api.get('/admin/staff'));
};

export const createStaff = async (payload) => {
  return apiCall(() => api.post('/admin/staff', payload));
};

export const updateStaff = async (id, payload) => {
  return apiCall(() => api.put(`/admin/staff/${id}`, payload));
};

export const deleteStaff = async (id) => {
  return apiCall(() => api.delete(`/admin/staff/${id}`));
};

export const fetchServices = async () => {
  return apiCall(() => api.get('/services'));
};

// Service management (Admin)
export const fetchAllServices = async () => {
  return apiCall(() => api.get('/admin/services'));
};

export const getServiceById = async (id) => {
  return apiCall(() => api.get(`/admin/services/${id}`));
};

export const createService = async (payload) => {
  return apiCall(() => api.post('/admin/services', payload));
};

export const updateService = async (id, payload) => {
  return apiCall(() => api.put(`/admin/services/${id}`, payload));
};

export const deleteService = async (id) => {
  return apiCall(() => api.delete(`/admin/services/${id}`));
};

// Payment management
export const fetchPayments = async () => {
  return apiCall(() => api.get('/admin/payments'));
};

export const getPaymentById = async (id) => {
  return apiCall(() => api.get(`/admin/payments/${id}`));
};

export const updatePaymentStatus = async (id, status, notes) => {
  return apiCall(() => api.put(`/admin/payments/${id}/status`, { status, notes }));
};

// Payment processing (Public)
export const createPaymentOrder = async (bookingId, amount) => {
  return apiCall(() => api.post('/payment/create-order', { bookingId, amount }));
};

export const verifyPayment = async (paymentData) => {
  return apiCall(() => api.post('/payment/verify', paymentData));
};

export default api;

