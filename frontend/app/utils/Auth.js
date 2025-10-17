// utils/Auth.js
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../config";

const API_URL = `${config.BACKEND_API_URL}/api/auth`;
const TOKEN_KEY = "token";

/* -------------------- Secure Storage Helpers -------------------- */
export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

/* -------------------- Auth API Calls -------------------- */

// Login
export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post(`${API_URL}/login`, { email, password });

    if (status === 200 && data?.token) {
      await saveToken(data.token);
      return { status: true, message: "Login successful" };
    }

    return { status: false, message: "Unexpected response from server" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: false,
      message: error.response?.data?.message || "Login failed. Please try again.",
    };
  }
};

// Signup
export const signup = async (firstName, lastName, email, password) => {
  try {
    const { data, status } = await axios.post(`${API_URL}/register`, {
      firstName,
      lastName,
      email,
      password,
    });

    if (status === 200 && data?.token) {
      await saveToken(data.token);
      return { status: true, message: "Signup successful" };
    }

    return { status: false, message: "Unexpected response from server" };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      status: false,
      message: error.response?.data?.message || "Signup failed. Please try again.",
    };
  }
};

// Logout
export const logout = async () => {
  await deleteToken();
};

/* -------------------- Token Utilities -------------------- */

// Validate token and check expiry
export const isAuthenticated = async () => {
  try {
    const token = await getToken();
    if (!token) return false;

    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      await deleteToken();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Token validation error:", err);
    await deleteToken();
    return false;
  }
};

// Decode token payload (e.g. user data)
export const getTokenInfo = async () => {
  try {
    const token = await getToken();
    return token ? jwtDecode(token) : null;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

// Auth header for API requests
export const authHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
