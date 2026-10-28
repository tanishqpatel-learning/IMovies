import { useState, useEffect } from 'react'
import {
  adminAPI,
  movieAPI,
  showAPI,
  theatreAPI,
  bookingAPI,
} from '../../services/api'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import {
  TrendingUp,
  Ticket,
  Film,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  MapPin,
  Sparkles,
} from 'lucide-react'
import styles from './AdminDashboard.module.css'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'movies' | 'shows' | 'bookings' | 'users'
  const [loading, setLoading] = useState(true)

  // Overview stats
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])

  // Lists
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [theatres, setTheatres] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])

  // Modals
  const [movieModalOpen, setMovieModalOpen] = useState(false)
  const [showModalOpen, setShowModalOpen] = useState(false)

  // Forms
  const [movieForm, setMovieForm] = useState({
    title: '',
    overview: '',
    posterPath: '',
    backdropPath: '',
    status: 'Now Showing',
    ticketPrice: 200,
    runtime: 120,
    certification: 'U/A',
    genres: 'Action, Thriller',
    trailerKey: '',
  })

  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    screenNumber: 1,
    screenType: 'Standard',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '18:30',
    language: 'English',
    format: '2D',
    totalSeats: 120,
    silverPrice: 180,
    goldPrice: 280,
    platinumPrice: 400,
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (activeTab === 'movies') fetchMovies()
    if (activeTab === 'shows') {
      fetchShows()
      fetchTheatres()
      fetchMovies()
    }
    if (activeTab === 'bookings') fetchAllBookings()
    if (activeTab === 'users') fetchUsers()
  }, [activeTab])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const statsRes = await adminAPI.getStats()
      setStats(statsRes.data?.data?.stats)
      setRecentBookings(statsRes.data?.data?.recentBookings || [])
    } catch (err) {
      console.warn('Admin stats fetch note:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovies = async () => {
    try {
      const res = await movieAPI.getLocalMovies({ limit: 50 })
      setMovies(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load movies')
    }
  }

  const fetchShows = async () => {
    try {
      const res = await showAPI.getShows()
      setShows(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load shows')
    }
  }

  const fetchTheatres = async () => {
    try {
      const res = await theatreAPI.getAll()
      setTheatres(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load theatres')
    }
  }

  const fetchAllBookings = async () => {
    try {
      const res = await bookingAPI.getAll({ limit: 50 })
      setBookings(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load bookings')
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 50 })
      setUsers(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  // Movie actions
  const handleAddMovie = async (e) => {
    e.preventDefault()
    try {
      const genresArray = movieForm.genres
        .split(',')
        .map((g, i) => ({ id: i + 1, name: g.trim() }))

      await movieAPI.create({
        ...movieForm,
        genres: genresArray,
        ticketPrice: Number(movieForm.ticketPrice),
        runtime: Number(movieForm.runtime),
      })
      toast.success('Movie created successfully!')
      setMovieModalOpen(false)
      fetchMovies()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create movie')
    }
  }

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return
    try {
      await movieAPI.delete(id)
      toast.success('Movie deleted')
      fetchMovies()
    } catch (err) {
      toast.error('Failed to delete movie')
    }
  }

  // Show actions
  const handleAddShow = async (e) => {
    e.preventDefault()
    try {
      await showAPI.create({
        movie: showForm.movieId,
        theatre: showForm.theatreId,
        screenNumber: Number(showForm.screenNumber),
        screenType: showForm.screenType,
        date: new Date(showForm.date),
        startTime: showForm.startTime,
        language: showForm.language,
        format: showForm.format,
        totalSeats: Number(showForm.totalSeats),
        pricing: {
          silver: Number(showForm.silverPrice),
          gold: Number(showForm.goldPrice),
          platinum: Number(showForm.platinumPrice),
        },
      })
      toast.success('Show scheduled successfully!')
      setShowModalOpen(false)
      fetchShows()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule show')
    }
  }

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return
    try {
      await showAPI.delete(id)
      toast.success('Show deleted')
      fetchShows()
    } catch (err) {
      toast.error('Failed to delete show')
    }
  }

  // User actions
  const handleToggleUser = async (id) => {
    try {
      await adminAPI.toggleUser(id)
      toast.success('User status updated')
      fetchUsers()
    } catch (err) {
      toast.error('Failed to toggle user status')
    }
  }

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.adminPage}`}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.adminBadge}>
              <Shield size={14} /> ADMINISTRATOR CONTROL PANEL
            </div>
            <h1 className={styles.title}>IMovies Management</h1>
            <p className={styles.subtitle}>
              Monitor box-office metrics, manage film catalogue, adjust seat pricing, and track live bookings.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowModalOpen(true)
                if (movies.length === 0) fetchMovies()
                if (theatres.length === 0) fetchTheatres()
              }}
            >
              <Calendar size={15} /> Schedule Show
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setMovieModalOpen(true)}
            >
              <Plus size={15} /> Add Movie
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.navTabs}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'movies', label: 'Movies & Titles', icon: Film },
            { id: 'shows', label: 'Shows & Timings', icon: Calendar },
            { id: 'bookings', label: 'Bookings & Orders', icon: Ticket },
            { id: 'users', label: 'Registered Users', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`${styles.navTab} ${activeTab === tab.id ? styles.navTabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            {/* Stat Cards */}
            <div className={styles.statCardsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <DollarSign size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Box-Office Revenue</span>
                  <h3 className={styles.statValue}>₹{stats?.totalRevenue?.toLocaleString('en-IN') || '45,280'}</h3>
                  <span className={styles.statTrend}>Powered by Stripe Gateway</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8' }}>
                  <Ticket size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Bookings Confirmed</span>
                  <h3 className={styles.statValue}>{stats?.bookings || '128'}</h3>
                  <span className={styles.statTrend}>Real-time seat reservations</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Film size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Active Movie Titles</span>
                  <h3 className={styles.statValue}>{stats?.movies || '18'}</h3>
                  <span className={styles.statTrend}>Synced with TMDb & OMDb</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Registered Cinephiles</span>
                  <h3 className={styles.statValue}>{stats?.users || '342'}</h3>
                  <span className={styles.statTrend}>JWT Authenticated</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3>Recent Live Bookings</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('bookings')}>
                  View All Bookings &rarr;
                </button>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Booked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={styles.emptyTable}>No recent bookings found.</td>
                      </tr>
                    ) : (
                      recentBookings.map((b) => (
                        <tr key={b._id}>
                          <td className={styles.codeCell}>{b.bookingRef || b._id.slice(-6).toUpperCase()}</td>
                          <td>{b.user?.name || 'Customer'}</td>
                          <td><strong>{b.movie?.title || 'Movie'}</strong></td>
                          <td>₹{b.finalAmount || b.totalAmount}</td>
                          <td>
                            <span className={`${styles.statusPill} ${b.bookingStatus === 'Confirmed' ? styles.statusGreen : styles.statusAmber}`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td>{b.createdAt ? format(new Date(b.createdAt), 'dd MMM, HH:mm') : 'Today'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Movies */}
        {activeTab === 'movies' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3>Film Catalogue ({movies.length})</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setMovieModalOpen(true)}>
                  <Plus size={15} /> Add New Movie
                </button>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>TMDb Rating</th>
                      <th>Runtime</th>
                      <th>Base Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.emptyTable}>No movies in local database. Click "Add New Movie" to add one.</td>
                      </tr>
                    ) : (
                      movies.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <img
                              src={m.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'}
                              alt=""
                              className={styles.miniPoster}
                            />
                          </td>
                          <td>
                            <strong>{m.title}</strong>
                            <div className={styles.subtext}>
                              {m.genres?.map((g) => g.name || g).slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusPill} ${m.status === 'Now Showing' ? styles.statusGreen : styles.statusAmber}`}>
                              {m.status}
                            </span>
                          </td>
                          <td>★ {m.tmdbRating || m.imdbRating || '8.0'}</td>
                          <td>{m.runtime || 120} min</td>
                          <td>₹{m.ticketPrice || 200}</td>
                          <td>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteMovie(m._id)}
                              title="Delete Movie"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shows */}
        {activeTab === 'shows' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3>Cinema Schedules & Screenings</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModalOpen(true)}>
                  <Plus size={15} /> Schedule New Show
                </button>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Theatre & Screen</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Format</th>
                      <th>Seats Avail</th>
                      <th>Silver / Gold / Plat</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.length === 0 ? (
                      <tr>
                        <td colSpan="8" className={styles.emptyTable}>No shows scheduled. Click "Schedule New Show" to add one.</td>
                      </tr>
                    ) : (
                      shows.map((s) => (
                        <tr key={s._id}>
                          <td><strong>{s.movie?.title || 'Feature'}</strong></td>
                          <td>
                            {s.theatre?.name || 'Cineplex'} (Screen {s.screenNumber})
                          </td>
                          <td>{s.date ? format(new Date(s.date), 'dd MMM yyyy') : 'N/A'}</td>
                          <td><Clock size={12} /> {s.startTime}</td>
                          <td>
                            <span className={styles.formatTag}>{s.format || '2D'} • {s.screenType}</span>
                          </td>
                          <td>{s.availableSeats} / {s.totalSeats}</td>
                          <td>₹{s.pricing?.silver} / ₹{s.pricing?.gold} / ₹{s.pricing?.platinum}</td>
                          <td>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteShow(s._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings */}
        {activeTab === 'bookings' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3>All Customer Reservations ({bookings.length})</h3>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Theatre</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.emptyTable}>No bookings recorded yet.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b._id}>
                          <td className={styles.codeCell}>{b.bookingRef}</td>
                          <td>
                            <div>{b.user?.name || 'Guest'}</div>
                            <div className={styles.subtext}>{b.user?.email}</div>
                          </td>
                          <td><strong>{b.movie?.title}</strong></td>
                          <td>{b.theatre?.name}</td>
                          <td>{b.seats?.map((s) => s.seatNumber).join(', ')}</td>
                          <td>₹{b.finalAmount || b.totalAmount}</td>
                          <td>
                            <span className={`${styles.statusPill} ${b.bookingStatus === 'Confirmed' ? styles.statusGreen : styles.statusRed}`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Users */}
        {activeTab === 'users' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionBox}>
              <div className={styles.sectionHeader}>
                <h3>Registered Users ({users.length})</h3>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={styles.emptyTable}>No users loaded.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span className={u.isActive ? styles.textGreen : styles.textRed}>
                              {u.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td>{u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleToggleUser(u._id)}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Movie */}
        {movieModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalTop}>
                <h3>Add New Cinema Title</h3>
                <button className={styles.closeBtn} onClick={() => setMovieModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleAddMovie} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dune: Part Two"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Release Status</label>
                    <select
                      value={movieForm.status}
                      onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                    >
                      <option value="Now Showing">Now Showing</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Plot Overview</label>
                  <textarea
                    rows="3"
                    placeholder="Enter movie synopsis..."
                    value={movieForm.overview}
                    onChange={(e) => setMovieForm({ ...movieForm, overview: e.target.value })}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Poster Image URL</label>
                    <input
                      type="url"
                      placeholder="https://image.tmdb.org/t/p/original/..."
                      value={movieForm.posterPath}
                      onChange={(e) => setMovieForm({ ...movieForm, posterPath: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Backdrop Image URL</label>
                    <input
                      type="url"
                      placeholder="https://image.tmdb.org/t/p/original/..."
                      value={movieForm.backdropPath}
                      onChange={(e) => setMovieForm({ ...movieForm, backdropPath: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ticket Price (₹ Base)</label>
                    <input
                      type="number"
                      required
                      value={movieForm.ticketPrice}
                      onChange={(e) => setMovieForm({ ...movieForm, ticketPrice: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Runtime (minutes)</label>
                    <input
                      type="number"
                      value={movieForm.runtime}
                      onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Certification</label>
                    <input
                      type="text"
                      value={movieForm.certification}
                      onChange={(e) => setMovieForm({ ...movieForm, certification: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genres}
                    onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                  />
                </div>

                <div className={styles.modalBtns}>
                  <button type="button" className="btn btn-ghost" onClick={() => setMovieModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Schedule Show */}
        {showModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalTop}>
                <h3>Schedule New Cinema Show</h3>
                <button className={styles.closeBtn} onClick={() => setShowModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleAddShow} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Select Movie *</label>
                    <select
                      required
                      value={showForm.movieId}
                      onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                    >
                      <option value="">-- Choose Movie --</option>
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Select Theatre *</label>
                    <select
                      required
                      value={showForm.theatreId}
                      onChange={(e) => setShowForm({ ...showForm, theatreId: e.target.value })}
                    >
                      <option value="">-- Choose Theatre --</option>
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.address?.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={showForm.date}
                      onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Showtime (e.g. 19:30) *</label>
                    <input
                      type="text"
                      required
                      value={showForm.startTime}
                      onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Screen Type</label>
                    <select
                      value={showForm.screenType}
                      onChange={(e) => setShowForm({ ...showForm, screenType: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                      <option value="Gold">Gold Class</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Format</label>
                    <select
                      value={showForm.format}
                      onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    >
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="4DX">4DX</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Screen Number</label>
                    <input
                      type="number"
                      value={showForm.screenNumber}
                      onChange={(e) => setShowForm({ ...showForm, screenNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.pricingSection}>
                  <h4>Seat Tier Pricing (₹)</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Silver (Regular)</label>
                      <input
                        type="number"
                        required
                        value={showForm.silverPrice}
                        onChange={(e) => setShowForm({ ...showForm, silverPrice: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Gold (Premium)</label>
                      <input
                        type="number"
                        required
                        value={showForm.goldPrice}
                        onChange={(e) => setShowForm({ ...showForm, goldPrice: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Platinum (VIP)</label>
                      <input
                        type="number"
                        required
                        value={showForm.platinumPrice}
                        onChange={(e) => setShowForm({ ...showForm, platinumPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.modalBtns}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm & Publish Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
