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

  // Set axios defaults untuk include credentials
  useEffect(() => {
    axios.defaults.withCredentials = true
    axios.defaults.baseURL = 'http://localhost:5000'
  }, [])

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
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { 
        email, 
        password 
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.user) {
        setUser(response.data.user)
        return response.data
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name, email, password, role = 'CUSTOMER') => {
    try {
      const response = await axios.post('/api/register', { 
        name, 
        email, 
        password, 
        role 
      }, {
        withCredentials: true
      })
      
      setUser(response.data.user)
      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/logout', {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}