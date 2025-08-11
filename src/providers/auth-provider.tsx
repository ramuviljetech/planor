"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthContextType, LoginCredentials, User } from "../types/auth";
import { tokenManager } from "../utils/token-manager";
import { storage } from "../utils/storage";
import AuthAPI from "../networking/auth-api";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Separate state variables
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have a valid token
      if (tokenManager.isTokenValid()) {
        const currentToken = tokenManager.getToken();
        const currentUser = storage.getUser();

        if (currentToken && currentUser) {
          setUser(currentUser);
          setToken(currentToken);
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          // Token exists but no user data, try to get user profile
          await getCurrentUser();
        }
      } else {
        // No valid token, clear any stale data
        tokenManager.clearTokens();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Auth initialization error:", error);
      tokenManager.clearTokens();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(error.message || "Authentication initialization failed");
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      const currentUser = await AuthAPI.getCurrentUser();
      storage.setUser(currentUser);
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      setError(null);
    } catch (error: any) {
      console.error("Get current user error:", error);
      tokenManager.clearTokens();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(error.message || "Failed to get user profile");
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // const response = await AuthAPI.login(credentials);
      // // Store token and user data
      // tokenManager.setToken(response.data.token, response.data.expiresIn);
      // storage.setUser(response.data.user);
      // setUser(response.data.user);
      // setToken(response.data.token);
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 1000);
      // setIsAuthenticated(true);
      // setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || "Login failed");
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear all auth data
      tokenManager.clearTokens();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
