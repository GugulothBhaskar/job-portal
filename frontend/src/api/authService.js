import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_URL = `${API_BASE_URL}/api/auth`;

const login = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

export default {
  login,
  isAuthenticated,
  logout
};