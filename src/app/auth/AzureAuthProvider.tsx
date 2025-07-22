'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PublicClientApplication, AuthenticationResult, AccountInfo } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'

// Azure AD Configuration
const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY || '',
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

// Scopes for API access
const loginRequest = {
  scopes: ['openid', 'profile', 'email']
}

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

interface AuthContextType {
  isAuthenticated: boolean
  user: AccountInfo | null
  login: () => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AzureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AccountInfo | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await msalInstance.initialize()
        
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          setUser(accounts[0])
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('MSAL initialization error:', error)
      }
    }

    initializeAuth()
  }, [])

  const login = async () => {
    try {
      const result = await msalInstance.loginPopup(loginRequest)
      setUser(result.account)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri
      })
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      if (!user) return null

      const request = {
        account: user,
        scopes: loginRequest.scopes
      }

      const response = await msalInstance.acquireTokenSilent(request)
      return response.accessToken
    } catch (error) {
      console.error('Token acquisition error:', error)
      return null
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    getAccessToken,
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </MsalProvider>
  )
} 