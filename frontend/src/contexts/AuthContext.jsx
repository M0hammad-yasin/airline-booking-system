import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
// ... existing code ...
import { jwtDecode } from 'jwt-decode';
// ... existing code ...

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
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Get user data
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
      const res = await axios.get('/api/v1/auth/me');
      setCurrentUser(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
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
      const res = await axios.post('/api/v1/auth/register', { name, email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
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
    delete axios.defaults.headers.common['Authorization'];
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