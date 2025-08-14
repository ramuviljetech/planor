import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Base configuration
const baseConfig: AxiosRequestConfig = {
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.1:3001/api",
  baseURL: "http://192.168.0.12:3001/api",
  timeout: 30000, // Increased from 10000ms to 30000ms
  headers: {
    "Content-Type": "application/json",
  },
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create(baseConfig);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log("📡 Axios: Starting request:", {
      url: config.url,
      method: config.method,
      timeout: config.timeout,
    });

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("📡 Axios: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log("📡 Axios: Response received successfully:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  },
  (error) => {
    console.log("📡 Axios: Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });

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
