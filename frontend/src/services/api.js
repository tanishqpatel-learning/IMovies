import axios from 'axios'
import { store } from '../store/store'
import { logout } from '../store/slices/authSlice'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API

// ==============================
// Auth APIs
// ==============================
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
}

// ==============================
// Movie APIs
// ==============================
export const movieAPI = {
  getTrending: (page = 1) => API.get('/movies/trending', { params: { page } }),
  search: (query, page = 1) => API.get('/movies/search', { params: { query, page } }),
  getDetails: (tmdbId) => API.get(`/movies/tmdb/${tmdbId}`),
  getLocalMovies: (params) => API.get('/movies', { params }),
  getById: (id) => API.get(`/movies/${id}`),
  getGenres: () => API.get('/movies/genres'),
  create: (data) => API.post('/movies', data),
  update: (id, data) => API.put(`/movies/${id}`, data),
  delete: (id) => API.delete(`/movies/${id}`),
}

// ==============================
// Show APIs
// ==============================
export const showAPI = {
  getShows: (params) => API.get('/shows', { params }),
  getById: (showId) => API.get(`/shows/${showId}`),
  reserveSeats: (showId, seats) => API.post(`/shows/${showId}/reserve`, { seats }),
  create: (data) => API.post('/shows', data),
  update: (id, data) => API.put(`/shows/${id}`, data),
  delete: (id) => API.delete(`/shows/${id}`),
}

// ==============================
// Seat APIs
// ==============================
export const seatAPI = {
  getLayout: (showId) => API.get(`/seats/show/${showId}`),
}

// ==============================
// Booking APIs
// ==============================
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/my', { params }),
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
  getAll: (params) => API.get('/bookings', { params }), // Admin
}

// ==============================
// Payment APIs
// ==============================
export const paymentAPI = {
  createIntent: (data) => API.post('/payments/create-intent', data),
  confirm: (paymentIntentId) => API.post('/payments/confirm', { paymentIntentId }),
  refund: (bookingId) => API.post(`/payments/refund/${bookingId}`),
  getPayment: (id) => API.get(`/payments/${id}`),
}

// ==============================
// Theatre APIs
// ==============================
export const theatreAPI = {
  getAll: (params) => API.get('/theatres', { params }),
  getById: (id) => API.get(`/theatres/${id}`),
  create: (data) => API.post('/theatres', data),
  update: (id, data) => API.put(`/theatres/${id}`, data),
  delete: (id) => API.delete(`/theatres/${id}`),
}

// ==============================
// User APIs
// ==============================
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  getNotifications: (params) => API.get('/users/notifications', { params }),
  markRead: (id) => API.put(`/users/notifications/${id}/read`),
  markAllRead: () => API.put('/users/notifications/read-all'),
}

// ==============================
// Admin APIs
// ==============================
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  updateRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  omdbSearch: (q) => API.get('/admin/omdb/search', { params: { q } }),
  omdbImport: (data) => API.post('/admin/omdb/import', data),
}
