import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5000';

// Flights API
export const flightAPI = {
  // Get all flights with optional filters
  searchFlights: async (filters) => {
    try {
      const response = await axios.get('/api/v1/flights', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single flight by ID
  getFlight: async (id) => {
    try {
      const response = await axios.get(`/api/v1/flights/${id}`);
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
      const response = await axios.get('/api/v1/bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single booking by ID
  getBooking: async (id) => {
    try {
      const response = await axios.get(`/api/v1/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await axios.post('/api/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel a booking
  cancelBooking: async (id) => {
    try {
      const response = await axios.put(`/api/v1/bookings/${id}/cancel`);
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
      const response = await axios.post('/api/v1/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await axios.get('/api/v1/payments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single payment
  getPayment: async (id) => {
    try {
      const response = await axios.get(`/api/v1/payments/${id}`);
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
      const response = await axios.put(`/api/v1/check-in/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get check-in status
  getCheckInStatus: async (bookingId) => {
    try {
      const response = await axios.get(`/api/v1/check-in/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};