import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react'

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const apiUrl = (path: string) => `${apiBase}${path}`

interface User {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load user data when token is available
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const response = await fetch(apiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${savedToken}` },
          })
          if (response.ok) {
            const data = await response.json()
            setUser(data)
            setToken(savedToken)
          } else {
            // Token is invalid, clear it
            setToken(null)
            localStorage.removeItem('token')
          }
        } catch (error) {
          // Token is invalid, clear it
          setToken(null)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      const message = typeof error.detail === 'string' ? error.detail : 'Login failed'
      throw new Error(message)
    }
    const data = await response.json()
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('token', data.access_token)
  }, [])

  const signup = useCallback(async (email: string, name: string, password: string) => {
    const response = await fetch(apiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      const message = typeof error.detail === 'string' ? error.detail : 'Signup failed'
      throw new Error(message)
    }
    const data = await response.json()
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('token', data.access_token)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
