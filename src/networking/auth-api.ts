import apiClient from "./axios-config";
import { LoginCredentials, AuthResponse, User } from "../types/auth";

export class AuthAPI {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error: any) {
      // Even if logout API fails, we should still clear local data
      console.error("Logout API error:", error);
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to get user profile"
      );
    }
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/send-otp", {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Forgot password request failed"
      );
    }
  }

  // Reset password
  static async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Password reset failed");
    }
  }

  // Verify email
  static async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/verify-otp", {
        email,
        otp,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Email verification failed"
      );
    }
  }
}

export default AuthAPI;
