# Authentication System Documentation

This document explains how to use the authentication system implemented in this application.

## Overview

The authentication system provides:

- JWT token-based authentication
- Automatic token management
- Axios interceptors for API calls
- React context for state management
- Route protection
- Secure token storage

## File Structure

```
src/
├── providers/
│   ├── auth-provider.tsx    # Main authentication provider
│   └── index.ts            # Provider exports
├── utils/
│   ├── storage.ts          # Secure storage utilities
│   └── token-manager.ts    # Token management
├── networking/
│   ├── axios-config.ts     # Axios configuration
│   ├── auth-api.ts         # Authentication API calls
│   └── api-service.ts      # General API service
├── types/
│   └── auth.ts            # TypeScript interfaces
└── components/
    ├── auth-guard/
    │   └── auth-guard.tsx # Route protection component
    └── user-profile.tsx   # Example user profile component
```

## Setup

### 1. Install Dependencies

```bash
npm install axios js-cookie
npm install --save-dev @types/js-cookie
```

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Wrap Your App

In `src/app/layout.tsx`:

```tsx
import { AuthProvider } from "@/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Usage

### 1. Using Authentication in Components

```tsx
import { useAuth } from "@/providers";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "password123",
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### 2. Protecting Routes

```tsx
import AuthGuard from "@/components/auth-guard";

const ProtectedPage = () => {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated users</div>
    </AuthGuard>
  );
};
```

### 3. Making API Calls

```tsx
import ApiService from "@/networking/api-service";

// GET request
const getData = async () => {
  try {
    const data = await ApiService.get("/api/users");
    console.log(data);
  } catch (error) {
    console.error("API call failed:", error);
  }
};

// POST request
const createData = async (userData: any) => {
  try {
    const response = await ApiService.post("/api/users", userData);
    console.log(response);
  } catch (error) {
    console.error("API call failed:", error);
  }
};

// File upload
const uploadFile = async (file: File) => {
  try {
    const response = await ApiService.uploadFile(
      "/api/upload",
      file,
      (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    );
    console.log(response);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### 4. Authentication API Calls

```tsx
import AuthAPI from "@/networking/auth-api";

// Login
const login = async () => {
  try {
    const response = await AuthAPI.login({
      email: "user@example.com",
      password: "password123",
    });
    console.log("Login successful:", response);
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const user = await AuthAPI.getCurrentUser();
    console.log("Current user:", user);
  } catch (error) {
    console.error("Failed to get user:", error);
  }
};

// Forgot password
const forgotPassword = async (email: string) => {
  try {
    const response = await AuthAPI.forgotPassword(email);
    console.log("Password reset email sent:", response);
  } catch (error) {
    console.error("Forgot password failed:", error);
  }
};
```

## Features

### 1. Automatic Token Management

- Tokens are automatically stored in localStorage
- Token expiration is handled automatically
- Automatic token refresh (when implemented)

### 2. Axios Interceptors

- Request interceptor adds auth headers automatically
- Response interceptor handles 401 errors
- Automatic logout on authentication failure

### 3. Secure Storage

- Tokens are stored securely in localStorage
- Token expiration tracking
- Automatic cleanup on logout

### 4. Error Handling

- Centralized error handling
- User-friendly error messages
- Automatic error clearing

### 5. Loading States

- Loading states during authentication
- Loading states during API calls
- Proper loading indicators

## API Endpoints

The authentication system expects these API endpoints:

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email

## Security Considerations

1. **HTTPS Only**: Ensure all API calls use HTTPS in production
2. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
3. **Token Expiration**: Tokens have automatic expiration handling
4. **CSRF Protection**: Implement CSRF tokens for sensitive operations
5. **Rate Limiting**: Implement rate limiting on auth endpoints

## Customization

### 1. Custom Token Storage

You can modify `src/utils/storage.ts` to use different storage methods:

```tsx
// Use sessionStorage instead of localStorage
localStorage.setItem(key, value); // Change to sessionStorage.setItem(key, value)
```

### 2. Custom API Base URL

Modify `src/networking/axios-config.ts`:

```tsx
const baseConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://your-api.com",
  // ... other config
};
```

### 3. Custom Error Handling

Modify the response interceptor in `src/networking/axios-config.ts`:

```tsx
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Custom error handling logic
    if (error.response?.status === 401) {
      // Custom 401 handling
    }
    return Promise.reject(error);
  }
);
```

## Troubleshooting

### 1. Token Not Being Sent

- Check if token is stored in localStorage
- Verify axios interceptor is working
- Check network tab for Authorization header

### 2. 401 Errors

- Token might be expired
- Check token validity in storage
- Verify API endpoint is correct

### 3. Login Not Working

- Check API endpoint URL
- Verify credentials format
- Check network tab for request/response

### 4. Logout Not Working

- Check if logout API is called
- Verify localStorage is cleared
- Check if user state is reset

## Examples

See the following files for complete examples:

- `src/app/(auth)/login/page.tsx` - Login page implementation
- `src/components/user-profile.tsx` - User profile component
- `src/components/auth-guard/auth-guard.tsx` - Route protection
