import { useState, useEffect } from 'react'
import { Effect } from 'effect'
import type { User, CreateUserRequest } from '@volunteer-proxy/shared'
import { makeApiClient } from '../services/ApiClient'

const TOKEN_KEY = 'auth_token'

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiClient = makeApiClient(() => token)

  useEffect(() => {
    if (token && !currentUser) {
      Effect.runPromise(apiClient.getCurrentUser())
        .then((user) => setCurrentUser(user))
        .catch((err) => {
          console.error('Failed to fetch current user:', err)
          logout()
        })
    }
  }, [token])

  const register = async (data: CreateUserRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(apiClient.register(data))
      localStorage.setItem(TOKEN_KEY, result.token)
      setToken(result.token)
      setCurrentUser(result.user as User)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(apiClient.login(email, password))
      localStorage.setItem(TOKEN_KEY, result.token)
      setToken(result.token)
      setCurrentUser(result.user as User)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCurrentUser(null)
  }

  return {
    token,
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  }
}
