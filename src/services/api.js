import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.145.239:8080', // Change to your backend IP
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;