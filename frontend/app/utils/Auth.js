// Auth.js (React Native using SecureStore)
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import config from "../config"

const API_URL = `${config.BACKEND_API_URL}/api/auth`;
const TOKEN_KEY = 'token';

// Save token
export const saveToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// Get token
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// Delete token
export const deleteToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// Login
export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    const { token } = res.data;
    await saveToken(token);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Signup
export const signup = async (firstName, lastName, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/register`, {
      firstName,
      lastName,
      email,
      password,
    });

    const { token } = res.data;
    await saveToken(token);
    return true;
  } catch (error) {
    console.error('Signup error:', error);
    return false;
  }
};

// Logout
export const logout = async () => {
  await deleteToken();
};

// Is Authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      await deleteToken();
      return false;
    }
    return true;
  } catch (err) {
    console.error('Invalid token', err);
    return false;
  }
};

// Get token info
export const getTokenInfo = async () => {
  const token = await getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
};

// Auth header
export const authHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
