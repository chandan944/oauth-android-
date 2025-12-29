import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.43.112:8080', // Change to your backend IP
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


























// import axios from 'axios';
// import { API_BASE_URL } from '../constants/config';
// import { getToken } from '../utils/storage';

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor - Add token to all requests
// api.interceptors.request.use(
//   async (config) => {
//     const token = await getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log('📤 API Request:', config.method.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors globally
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Response:', response.config.url, response.status);
//     return response;
//   },
//   (error) => {
//     console.error('❌ API Error:', error.response?.status, error.response?.data);
    
//     // Handle specific error codes
//     if (error.response?.status === 401) {
//       // Token expired or invalid - redirect to login
//       console.log('🔒 Unauthorized - Token may be expired');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;


