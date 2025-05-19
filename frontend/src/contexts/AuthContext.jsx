import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api'; // Import the new apiClient
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // The apiClient's interceptor will handle setting the Authorization header
          fetchCurrentUser();
        }
      } catch (error) {
        console.error('Invalid token', error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      // Use apiClient for the request
      const res = await apiClient.get('/api/v1/auth/me');
      setCurrentUser(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      // Use apiClient for the request
      const res = await apiClient.post('/api/v1/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token); // This will trigger the useEffect to set the header via interceptor
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Use apiClient for the request
      const res = await apiClient.post('/api/v1/auth/register', { name, email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token); // This will trigger the useEffect to set the header via interceptor
      return { success: true };
    } catch (error) {
      console.error('Registration error', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    // The interceptor will no longer add the Authorization header as token is null
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};