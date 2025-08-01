const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

export const storage = {
  // Token storage
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // User storage
  setUser: (user: any): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): any => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  // Token expiry storage
  setTokenExpiry: (expiry: number): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    }
  },

  getTokenExpiry: (): number | null => {
    if (typeof window !== "undefined") {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    }
    return null;
  },

  removeTokenExpiry: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  },

  // Clear all auth data
  clearAuthData: (): void => {
    storage.removeToken();
    storage.removeUser();
    storage.removeTokenExpiry();
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const expiry = storage.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() > expiry;
  },
};
