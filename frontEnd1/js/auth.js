// Authentication related functions

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Function to check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (token) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
            logoutBtn.addEventListener('click', logout);
        }
        
        // Get user info
        getCurrentUser();
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Function to register a new user
async function registerUser(userData) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        const { token } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Update UI
        checkAuthStatus();
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed. Please try again.'
        };
    }
}

// Function to login user
async function loginUser(credentials) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        const { token } = response.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Update UI
        checkAuthStatus();
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed. Please check your credentials.'
        };
    }
}

// Function to get current user info
async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error getting user info:', error.response?.data || error.message);
        
        // If token is invalid, logout user
        if (error.response?.status === 401) {
            logout();
        }
        
        return null;
    }
}

// Function to logout user
function logout() {
    localStorage.removeItem('token');
    checkAuthStatus();
    
    // Redirect to home page if not already there
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
}

// Setup login form event listener if on login page
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = await loginUser({ email, password });
            
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                // Display error message
                const errorElement = document.getElementById('loginError');
                if (errorElement) {
                    errorElement.textContent = result.error;
                    errorElement.classList.remove('hidden');
                }
            }
        });
    }
}

// Setup register form event listener if on register page
if (window.location.pathname.includes('register.html')) {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = await registerUser({ name, email, password });
            
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                // Display error message
                const errorElement = document.getElementById('registerError');
                if (errorElement) {
                    errorElement.textContent = result.error;
                    errorElement.classList.remove('hidden');
                }
            }
        });
    }
}