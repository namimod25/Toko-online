import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [, setLogoutState] = useState({
    isLoggingOut: false,
    isSuccess: false,
    message: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      verifyToken()
    } else {
      setLoading(false)
    }
    checkAuthStatus()
  }, [])

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/status')
      if (response.data.authenticated) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

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

  const login = async (email, password, captchaId, captchaAnswer) => {
    try {
      const response = await axios.post('/api/login', {
        email,
        password,
        captchaId,
        captchaAnswer
      })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)

      return { success: true, user }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    setLogoutState({
      isLoggingOut: true,
      isSuccess: false,
      message: ''
    });
    try {
      await axios.post('/api/logout');

      setLogoutState({
        isLoggingOut: false,
        isSuccess: true,
        message: '√ Logout successful'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      setUser(null);

      setLogoutState({
        isLoggingOut: false,
        isSuccess: false,
        message: ''
      });
    } catch (error) {
      console.error('Logout error:', error);

      // Show error for 2 seconds
      setLogoutState({
        isLoggingOut: false,
        isSuccess: false,
        message: 'Logout failed. Please try again.'
      });

      // Auto hide error after 2 seconds
      setTimeout(() => {
        setLogoutState({
          isLoggingOut: false,
          isSuccess: false,
          message: ''
        });
      }, 2000);
    }

    // cleanup
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}