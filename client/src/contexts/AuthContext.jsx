import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logoutState, setLogoutState] = useState({
    isLoggingOut: false,
    isSuccess: false,
    message: ''
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status')
      if (response.data.authenticated) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

   const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/register', userData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Simpan user dan token
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    setLogoutState({
      isLoggingOut: true,
      isSuccess: false,
      message: ''
    })

    try {
      await axios.post('/api/logout')

      setLogoutState({
        isLoggingOut: false,
        isSuccess: true,
        message: '√ Logout successful'
      })

      await new Promise(resolve => setTimeout(resolve, 1500))

      setUser(null)
      setLogoutState({
        isLoggingOut: false,
        isSuccess: false,
        message: ''
      })

    } catch (error) {
      console.error('Logout error:', error)
      setLogoutState({
        isLoggingOut: false,
        isSuccess: false,
        message: 'Logout failed. Please try again.'
      })

      setTimeout(() => {
        setLogoutState({
          isLoggingOut: false,
          isSuccess: false,
          message: ''
        })
      }, 2000)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    logoutState
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}