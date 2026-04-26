import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

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