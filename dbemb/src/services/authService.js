// API base URL - adjust according to your backend port
const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google Sign-In using ID token
  async googleSignIn(idToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google sign-in failed');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Check if userData is FormData
      const isFormData = userData instanceof FormData;
      
      console.log('AuthService register called');
      console.log('userData type:', userData.constructor.name);
      console.log('isFormData:', isFormData);
      
      const options = {
        method: 'POST',
        body: isFormData ? userData : JSON.stringify(userData),
      };

      // Only set Content-Type for JSON, not for FormData
      if (!isFormData) {
        options.headers = {
          'Content-Type': 'application/json',
        };
      }

      console.log('Request options:', options);

      const response = await fetch(`${API_BASE_URL}/auth/register`, options);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Get stored user data
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is member or admin
  isMember() {
    const user = this.getUser();
    return user && ['admin', 'member'].includes(user.role);
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid (treat 403 as expired/invalid for client-side handling)
      this.logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  // HTTP helper methods
  async get(endpoint) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
        method: 'GET'
      });
      return await response.json();
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
      });
      return await response.json();
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }
}

export default new AuthService();