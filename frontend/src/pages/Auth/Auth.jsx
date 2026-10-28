import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authAPI } from '../../services/api'
import { setCredentials } from '../../store/slices/authSlice'
import { toast } from 'react-toastify'
import { Film, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import styles from './Auth.module.css'

function AuthInput({ label, type, value, onChange, icon: Icon, placeholder, required, id }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className={styles.inputWrapper}>
        {Icon && <Icon size={16} className={styles.inputIcon} />}
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-input ${Icon ? styles.inputWithIcon : ''}`}
        />
        {isPassword && (
          <button type="button" className={styles.showPass} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      dispatch(setCredentials({ user: data.user, token: data.token }))
      toast.success(`Welcome back, ${data.user.name}! 🎬`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.authBgOverlay} />
      </div>

      <div className={styles.authContainer}>
        <div className={styles.authCard + ' glass-card'}>
          {/* Logo */}
          <div className={styles.authLogo}>
            <Link to="/">
              <div className={styles.logoWrap}>
                <Film size={24} />
              </div>
            </Link>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>Sign in to continue booking your favourite movies</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AuthInput id="email" label="Email Address" type="email" icon={Mail}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com" required />
            <AuthInput id="password" label="Password" type="password" icon={Lock}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password" required />

            <div className={styles.forgotRow}>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" className={`btn btn-primary btn-lg w-full ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><div className={styles.spinner} /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className={styles.authFooter}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.authLink}>Create Account</Link>
          </div>

          {/* Demo accounts */}
          <div className={styles.demoAccounts}>
            <div className={styles.demoTitle}>Demo Accounts</div>
            <div className={styles.demoGrid}>
              <button className={styles.demoBtn} onClick={() => setForm({ email: 'demo@imovies.com', password: 'user123' })}>
                👤 User
              </button>
              <button className={styles.demoBtn} onClick={() => setForm({ email: 'admin@imovies.com', password: 'admin123' })}>
                🔑 Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      dispatch(setCredentials({ user: data.user, token: data.token }))
      toast.success(`Welcome to IMovies, ${data.user.name}! 🎬`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.authBgOverlay} />
      </div>

      <div className={styles.authContainer}>
        <div className={styles.authCard + ' glass-card'}>
          <div className={styles.authLogo}>
            <Link to="/">
              <div className={styles.logoWrap}><Film size={24} /></div>
            </Link>
            <h1 className={styles.authTitle}>Create Account</h1>
            <p className={styles.authSubtitle}>Join IMovies and start booking cinema tickets</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AuthInput id="name" label="Full Name" type="text" icon={User}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe" required />
            <AuthInput id="email" label="Email Address" type="email" icon={Mail}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com" required />
            <AuthInput id="password" label="Password" type="password" icon={Lock}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters" required />
            <AuthInput id="phone" label="Phone Number (optional)" type="tel" icon={Phone}
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210" />

            <button type="submit" className={`btn btn-primary btn-lg w-full ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><div className={styles.spinner} /> Creating Account...</> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className={styles.authFooter}>
            Already have an account?{' '}
            <Link to="/login" className={styles.authLink}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
