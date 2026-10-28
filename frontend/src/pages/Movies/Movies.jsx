import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { movieAPI } from '../../services/api'
import { Star, Clock, Search, Filter, Sparkles, ChevronRight, Play, Film } from 'lucide-react'
import styles from './Movies.module.css'

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Horror',
  'Mystery',
  'Sci-Fi',
  'Thriller',
]

const STATUS_TABS = [
  { id: 'all', label: 'All Movies' },
  { id: 'now_showing', label: 'Now Showing' },
  { id: 'coming_soon', label: 'Coming Soon' },
  { id: 'trending', label: 'Trending This Week' },
]

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const initialGenre = searchParams.get('genre') || 'All'

  const [activeTab, setActiveTab] = useState(initialStatus)
  const [selectedGenre, setSelectedGenre] = useState(initialGenre)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [activeTab, selectedGenre, sortBy])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      if (activeTab === 'trending') {
        const res = await movieAPI.getTrending()
        const trendingList = res.data?.data?.trending || res.data?.data?.nowPlaying || []
        setMovies(trendingList)
      } else {
        const params = {}
        if (activeTab === 'now_showing') params.status = 'Now Showing'
        if (activeTab === 'coming_soon') params.status = 'Coming Soon'
        if (selectedGenre !== 'All') params.genre = selectedGenre

        const res = await movieAPI.getLocalMovies(params)
        let list = res.data?.data || []

        // If local is empty, try getting trending fallback
        if (list.length === 0) {
          const trendRes = await movieAPI.getTrending()
          list = trendRes.data?.data?.nowPlaying || []
        }

        // Apply sort
        if (sortBy === 'rating') {
          list = [...list].sort((a, b) => (b.tmdbRating || 0) - (a.tmdbRating || 0))
        } else if (sortBy === 'newest') {
          list = [...list].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
        } else if (sortBy === 'title') {
          list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        }

        setMovies(list)
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err)
      // Fallback empty list
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  // Filter with search query
  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      movie.title?.toLowerCase().includes(q) ||
      movie.genres?.some((g) => (g.name || g).toLowerCase().includes(q)) ||
      movie.director?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.moviesPage}`}>
        {/* Header Banner */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.badge}>
              <Sparkles size={14} /> CURATED CINEMA CATALOG
            </span>
            <h1 className={styles.title}>Explore Movies</h1>
            <p className={styles.subtitle}>
              Discover blockbusters, critically acclaimed features, and indie gems showing in theaters near you.
            </p>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by movie title, cast, or director..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs & Controls */}
        <div className={styles.controlsBar}>
          <div className={styles.tabs}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearchParams({ status: tab.id, genre: selectedGenre })
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort By:</span>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="newest">Release Date</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className={styles.genrePills}>
          {GENRES.map((g) => (
            <button
              key={g}
              className={`${styles.genrePill} ${selectedGenre === g ? styles.genreActive : ''}`}
              onClick={() => {
                setSelectedGenre(g)
                setSearchParams({ status: activeTab, genre: g })
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonSub} />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Film size={48} />
            </div>
            <h3>No movies found</h3>
            <p>We couldn't find any movies matching your current filters or search term.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setActiveTab('all')
                setSelectedGenre('All')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={styles.movieGrid}>
            {filteredMovies.map((movie) => {
              const id = movie._id || movie.tmdbId
              const poster =
                movie.posterPath ||
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'
              const rating = movie.tmdbRating ? Number(movie.tmdbRating).toFixed(1) : (movie.imdbRating || '8.2')
              const genres = movie.genres
                ?.map((g) => (typeof g === 'object' ? g.name : g))
                .filter(Boolean)
                .slice(0, 2)
                .join(', ')

              return (
                <div key={id} className={styles.card}>
                  <Link to={`/movie/${id}`} className={styles.posterWrap}>
                    <img src={poster} alt={movie.title} className={styles.poster} loading="lazy" />
                    
                    <div className={styles.posterOverlay}>
                      <span className={styles.quickViewBtn}>
                        <Play size={14} fill="#fff" /> Quick View
                      </span>
                    </div>

                    <div className={styles.ratingBadge}>
                      <Star size={13} fill="#fbbf24" color="#fbbf24" />
                      <span>{rating}</span>
                    </div>

                    {movie.status && (
                      <span className={`${styles.statusBadge} ${movie.status === 'Coming Soon' ? styles.statusComing : styles.statusNow}`}>
                        {movie.status}
                      </span>
                    )}
                  </Link>

                  <div className={styles.cardContent}>
                    <div className={styles.metaRow}>
                      <span className={styles.genreText}>{genres || 'Feature Film'}</span>
                      {movie.runtime && (
                        <span className={styles.runtimeText}>
                          <Clock size={11} /> {movie.runtime}m
                        </span>
                      )}
                    </div>

                    <h3 className={styles.movieTitle}>
                      <Link to={`/movie/${id}`}>{movie.title}</Link>
                    </h3>

                    <p className={styles.overview}>
                      {movie.overview
                        ? movie.overview.slice(0, 75) + '...'
                        : 'Experience cinematic entertainment on the grandest screens with immersive Dolby surround sound.'}
                    </p>

                    <div className={styles.cardFooter}>
                      <span className={styles.priceTag}>
                        From <strong>₹{movie.ticketPrice || 180}</strong>
                      </span>
                      <Link to={`/movie/${id}`} className={`btn btn-primary btn-sm ${styles.bookBtn}`}>
                        Book Now <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
