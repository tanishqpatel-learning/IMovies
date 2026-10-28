import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authAPI } from './services/api'
import { setCredentials, logout } from './store/slices/authSlice'
import './App.css'

// Components
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// Pages
import HomePage from './pages/Home/Home'
import MoviesPage from './pages/Movies/Movies'
import MovieDetailPage from './pages/MovieDetail/MovieDetail'
import SeatSelectionPage from './pages/SeatSelection/SeatSelection'
import CheckoutPage from './pages/Checkout/Checkout'
import BookingsPage from './pages/Bookings/Bookings'
import BookingDetailsPage from './pages/BookingDetails/BookingDetails'
import AdminDashboardPage from './pages/Admin/AdminDashboard'
import TheatresPage from './pages/Theatres/Theatres'
import ProfilePage from './pages/Profile/Profile'
import NotificationsPage from './pages/Notifications/Notifications'
import { LoginPage, RegisterPage } from './pages/Auth/Auth'

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// 404 Not Found Page
function NotFoundPage() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '72px', fontWeight: '900', color: 'var(--primary)', lineHeight: 1, marginBottom: '16px' }}>404</div>
      <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '12px' }}>Curtain Closed — Page Not Found</h2>
      <p style={{ color: '#9ca3af', maxWidth: '440px', marginBottom: '28px', fontSize: '15px' }}>
        The cinema reel you're looking for doesn't exist or has moved to another theatre auditorium.
      </p>
      <a href="/" className="btn btn-primary btn-lg">Return to Home Screen</a>
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  // Verify and hydrate current user if token exists in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('imovies_token')
    if (storedToken && !token) {
      authAPI.getMe()
        .then((res) => {
          if (res.data?.user) {
            dispatch(setCredentials({ user: res.data.user, token: storedToken }))
          }
        })
        .catch(() => {
          dispatch(logout())
        })
    }
  }, [dispatch, token])

  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />

      <main className="app-main">
        <Routes>
          {/* Public Home & Movies */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/movie/tmdb/:tmdbId" element={<MovieDetailPage />} />
          <Route path="/movies/tmdb/:tmdbId" element={<MovieDetailPage />} />
          <Route path="/theatres" element={<TheatresPage />} />

          {/* User Profile & Notifications */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Seat Selection */}
          <Route
            path="/booking/:showId"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shows/:showId/seats"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />

          {/* Checkout (Stripe) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Bookings & Digital Pass */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Control Panel */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
