import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('nirog.life'))
    ? import.meta.env.VITE_API_URL
    : 'https://nirogapp-admin-panel.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and redirect to login if session expires
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('admin_email');
      localStorage.removeItem('admin_name');
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
