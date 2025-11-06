import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry automático em erros 5xx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
