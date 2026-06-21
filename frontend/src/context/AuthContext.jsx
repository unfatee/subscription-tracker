import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const signOut = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getMe().then(setUser).catch(signOut).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', signOut)
    return () => window.removeEventListener('auth:unauthorized', signOut)
  }, [])

  const signIn = async (credentials) => {
    const result = await authApi.login(credentials)
    localStorage.setItem('access_token', result.access_token)
    setUser(result.user)
    return result.user
  }

  const refreshUser = async () => {
    const nextUser = await authApi.getMe()
    setUser(nextUser)
    return nextUser
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
