import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { toggleSearch } from '../../store/slices/uiSlice'
import { movieAPI } from '../../services/api'
import styles from './Navbar.module.css'
import {
  Search, Bell, User, LogOut, Film, Ticket, Settings,
  Menu, X, Home, Star, ChevronDown, MapPin,
} from 'lucide-react'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad']

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [city, setCity] = useState(localStorage.getItem('imovies_city') || 'Mumbai')
  const searchRef = useRef(null)
  const searchTimer = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value) => {
    setSearchQuery(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!value.trim()) { setSearchResults([]); return }
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await movieAPI.search(value)
        setSearchResults([...data.data.local.slice(0, 4), ...data.data.tmdb.slice(0, 4)])
      } catch (e) { setSearchResults([]) }
      setSearching(false)
    }, 400)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setUserMenuOpen(false)
  }

  const handleCitySelect = (c) => {
    setCity(c)
    localStorage.setItem('imovies_city', c)
    setCityOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/movies?status=Coming+Soon', label: 'Coming Soon', icon: Star },
    { to: '/theatres', label: 'Theatres', icon: MapPin },
  ]

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Film size={20} />
          </div>
          <span className={styles.logoText}>I<span className={styles.logoAccent}>Movies</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${location.pathname === to ? styles.active : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className={styles.rightSection}>
          {/* City Selector */}
          <div className={styles.citySelector} onClick={() => setCityOpen(!cityOpen)}>
            <MapPin size={14} />
            <span>{city}</span>
            <ChevronDown size={14} className={cityOpen ? styles.rotated : ''} />
            {cityOpen && (
              <div className={styles.cityDropdown}>
                {CITIES.map((c) => (
                  <button key={c} className={`${styles.cityOption} ${c === city ? styles.cityActive : ''}`}
                    onClick={() => handleCitySelect(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={18} />
            </button>
            {searchOpen && (
              <div className={styles.searchDropdown}>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search movies, genres..."
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]) }}>
                      <X size={14} />
                    </button>
                  )}
                </form>
                {searching && <div className={styles.searchLoading}>Searching...</div>}
                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    {searchResults.map((movie, i) => (
                      <Link
                        key={i}
                        to={movie._id ? `/movie/${movie._id}` : `/movie/tmdb/${movie.tmdbId}`}
                        className={styles.searchResultItem}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }}
                      >
                        <img
                          src={movie.posterPath || movie.poster_path || '/placeholder-movie.jpg'}
                          alt={movie.title}
                          className={styles.searchResultImg}
                          onError={(e) => { e.target.src = '/placeholder-movie.jpg' }}
                        />
                        <div>
                          <div className={styles.searchResultTitle}>{movie.title}</div>
                          <div className={styles.searchResultMeta}>
                            {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}
                            {movie.genres?.length > 0 && ` • ${movie.genres[0].name || movie.genres[0]}`}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" className={styles.iconBtn} title="Notifications" style={{ position: 'relative' }}>
                <Bell size={18} />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 6px var(--primary-glow)',
                }} />
              </Link>

              {/* User Menu */}
              <div className={styles.userMenu}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className={styles.avatar}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={userMenuOpen ? styles.rotated : ''} />
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <div className={styles.userDropdownName}>{user?.name}</div>
                      <div className={styles.userDropdownEmail}>{user?.email}</div>
                      {user?.role === 'admin' && (
                        <span className={styles.adminBadge}>Admin</span>
                      )}
                    </div>
                    <div className={styles.userDropdownDivider} />
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/bookings" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <Ticket size={15} /> My Bookings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <Settings size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className={styles.userDropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={styles.mobileNavLink}
              onClick={() => setMobileOpen(false)}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className={styles.mobileAuthBtns}>
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <button className={`${styles.mobileNavLink} ${styles.logoutBtn}`} onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
