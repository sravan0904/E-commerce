import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, userAPI } from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials)
    const { token, ...userData } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { token, ...userData } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUserData = useCallback((newData) => {
    const updated = { ...user, ...newData }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }, [user])

  const isAdmin = user?.roles?.includes('ROLE_ADMIN')
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
