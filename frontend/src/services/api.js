import axios from 'axios';

// Create a new Axios instance with a base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

// Set up a request interceptor to include the token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flights API
export const flightAPI = {
  // Get all flights with optional filters
  searchFlights: async (filters) => {
    try {
      const response = await apiClient.get('/api/v1/flights', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single flight by ID
  getFlight: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/flights/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Bookings API
export const bookingAPI = {
  // Get all user bookings
  getUserBookings: async () => {
    try {
      const response = await apiClient.get('/api/v1/bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single booking by ID
  getBooking: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/api/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel a booking
  cancelBooking: async (id) => {
    try {
      const response = await apiClient.put(`/api/v1/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Payments API
export const paymentAPI = {
  // Process a payment
  processPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/api/v1/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await apiClient.get('/api/v1/payments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single payment
  getPayment: async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Check-in API
export const checkInAPI = {
  // Perform check-in
  performCheckIn: async (bookingId) => {
    try {
      const response = await apiClient.put(`/api/v1/check-in/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get check-in status
  getCheckInStatus: async (bookingId) => {
    try {
      const response = await apiClient.get(`/api/v1/check-in/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Export the apiClient instance if you need to use it directly elsewhere
export default apiClient;