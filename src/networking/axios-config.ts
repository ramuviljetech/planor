import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Base configuration
const baseConfig: AxiosRequestConfig = {
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.1:3001/api",
  baseURL: "http://192.168.0.11:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create(baseConfig);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized) - only redirect if user was previously authenticated
    if (error.response?.status === 401) {
      const token = localStorage.getItem("auth_token");

      // Only redirect if there was a token (user was authenticated)
      if (token) {
        // Clear auth data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token_expiry");

        // Redirect to login page if not already there
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
