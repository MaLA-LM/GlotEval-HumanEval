import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You could add any request preprocessing here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request);
      // You might want to show a network error toast/notification here
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;