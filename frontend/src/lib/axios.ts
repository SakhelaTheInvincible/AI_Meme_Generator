import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Django backend URL
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' },
});

export default instance; 