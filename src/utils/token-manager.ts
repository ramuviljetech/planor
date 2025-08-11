import { storage } from "./storage";
import { TokenData } from "../types/auth";

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Store token with expiry
  setToken(token: string, expiresIn: string = "24h"): void {
    const expiresAt = this.calculateExpiry(expiresIn);
    storage.setToken(token);
    storage.setTokenExpiry(expiresAt);
  }

  // Get current token
  getToken(): string | null {
    return storage.getToken();
  }

  // Check if token is valid
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !storage.isTokenExpired();
  }

  // Clear all tokens
  clearTokens(): void {
    storage.clearAuthData();
  }

  // Calculate token expiry time
  private calculateExpiry(expiresIn: string): number {
    const now = Date.now();
    const expiryMap: { [key: string]: number } = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const expiryMs = expiryMap[expiresIn] || 24 * 60 * 60 * 1000; // Default to 24h
    return now + expiryMs;
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    return storage.getTokenExpiry();
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() > expiry - fiveMinutes;
  }

  // Refresh token (placeholder for future implementation)
  async refreshToken(): Promise<string | null> {
    // This would typically make an API call to refresh the token
    // For now, we'll return null to indicate refresh is needed
    console.log("Token refresh needed");
    return null;
  }

  // Get authorization header
  getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
