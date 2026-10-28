import { createSlice } from '@reduxjs/toolkit'

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('imovies_user')) || null
  } catch { return null }
}

const getTokenFromStorage = () => {
  return localStorage.getItem('imovies_token') || null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    token: getTokenFromStorage(),
    isAuthenticated: !!getTokenFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('imovies_user', JSON.stringify(user))
      localStorage.setItem('imovies_token', token)
    },
    setUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem('imovies_user', JSON.stringify(action.payload))
    },
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('imovies_user')
      localStorage.removeItem('imovies_token')
    },
  },
})

export const { setCredentials, setUser, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer
