import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { movieAPI } from '../../services/api'
import { Star, Clock, Play, ChevronLeft, ChevronRight, TrendingUp, Calendar, Zap, Sparkles, MapPin, Tv, Shield, Award } from 'lucide-react'
import styles from './Home.module.css'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

const GENRE_FILTERS = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Animation']

function MovieCard({ movie, onClick }) {
  const poster = movie.posterPath || movie.poster_path
  const rating = movie.tmdbRating || movie.vote_average
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''
  const genre = movie.genres?.[0]?.name || ''

  return (
    <div className="movie-card animate-fade-in" onClick={onClick} role="button" tabIndex={0}>
      <div className="movie-card-poster">
        <img
          src={poster || PLACEHOLDER_IMG}
          alt={movie.title}
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
        />
        <div className="movie-card-overlay">
          <div className={styles.overlayContent}>
            <div className={styles.playBtn}><Play size={20} fill="white" /></div>
            <span className={styles.overlayText}>Book Tickets</span>
          </div>
        </div>
        {rating > 0 && (
          <div className={styles.ratingBadge}>
            <Star size={11} fill="#f5c518" color="#f5c518" />
            {Number(rating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="movie-card-info">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          {year && <span>{year}</span>}
          {genre && <><span>•</span><span>{genre}</span></>}
          {movie.certification && <><span>•</span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{movie.certification}</span></>}
        </div>
      </div>
    </div>
  )
}

function HeroSlider({ movies, onWatchTrailer }) {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  const next = useCallback(() => setCurrent((p) => (p + 1) % movies.length), [movies.length])
  const prev = () => setCurrent((p) => (p - 1 + movies.length) % movies.length)

  useEffect(() => {
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [next])

  if (!movies.length) return null
  const movie = movies[current]

  return (
    <div className={styles.hero}>
      <div className={styles.heroImages}>
        {movies.slice(0, 5).map((m, i) => (
          <div
            key={i}
            className={`${styles.heroSlide} ${i === current ? styles.heroSlideActive : ''}`}
            style={{ backgroundImage: `url(${m.backdropPath || m.backdrop_path || PLACEHOLDER_IMG})` }}
          />
        ))}
      </div>
      <div className={styles.heroGradient} />

      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroInfo}>
          <div className={styles.heroGenres}>
            {movie.genres?.slice(0, 3).map((g, i) => (
              <span key={i} className="genre-badge">{g.name || g}</span>
            ))}
          </div>
          <h1 className={styles.heroTitle}>{movie.title}</h1>
          <p className={styles.heroOverview}>{movie.overview?.slice(0, 180)}...</p>

          <div className={styles.heroMeta}>
            {movie.tmdbRating > 0 && (
              <div className="rating-badge">
                <Star size={13} fill="#f5c518" color="#f5c518" />
                {Number(movie.tmdbRating).toFixed(1)}
              </div>
            )}
            {movie.runtime && (
              <span className={styles.heroMetaItem}>
                <Clock size={14} /> {movie.runtime}m
              </span>
            )}
            {movie.releaseDate && (
              <span className={styles.heroMetaItem}>
                <Calendar size={14} /> {new Date(movie.releaseDate).getFullYear()}
              </span>
            )}
          </div>

          <div className={styles.heroBtns}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(movie._id ? `/movie/${movie._id}` : `/movie/tmdb/${movie.tmdbId}`)}
            >
              <Zap size={18} /> Book Tickets
            </button>
            {movie.trailerKey ? (
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => onWatchTrailer(movie.trailerKey)}
              >
                <Play size={18} /> Watch Trailer
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => navigate(movie._id ? `/movie/${movie._id}` : `/movie/tmdb/${movie.tmdbId}`)}
              >
                <Play size={18} /> View Details
              </button>
            )}
          </div>
        </div>

        {/* Poster */}
        <div className={styles.heroPoster}>
          <img
            src={movie.posterPath || movie.poster_path || PLACEHOLDER_IMG}
            alt={movie.title}
            onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
          />
        </div>
      </div>

      {/* Controls */}
      <button className={`${styles.heroArrow} ${styles.heroArrowLeft}`} onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button className={`${styles.heroArrow} ${styles.heroArrowRight}`} onClick={next} aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className={styles.heroDots}>
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            className={`${styles.heroDot} ${i === current ? styles.heroDotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function Section({ title, movies, viewAll, icon: Icon, extraHeader }) {
  const navigate = useNavigate()
  return (
    <section className={styles.section}>
      <div className="section-header">
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          {Icon && <Icon size={22} color="var(--primary)" />}
          <h2 className="section-title" style={{ paddingLeft: Icon ? '0' : '16px' }}>{title}</h2>
        </div>
        {viewAll && (
          <Link to={viewAll} className={styles.viewAll}>View All →</Link>
        )}
      </div>

      {extraHeader}

      <div className="movies-grid stagger-children">
        {movies.map((m, i) => (
          <MovieCard
            key={m._id || m.tmdbId || i}
            movie={m}
            onClick={() => navigate(m._id ? `/movie/${m._id}` : `/movie/tmdb/${m.tmdbId}`)}
          />
        ))}
      </div>
    </section>
  )
}

function SkeletonCard() {
  return (
    <div className="movie-card">
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div style={{ padding: '14px' }}>
        <div className="skeleton" style={{ height: '18px', marginBottom: '8px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [trending, setTrending] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [activeGenre, setActiveGenre] = useState('All')
  const [loading, setLoading] = useState(true)
  const [activeTrailer, setActiveTrailer] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await movieAPI.getTrending()
        setTrending(data.data.trending || [])
        setNowPlaying(data.data.nowPlaying || [])
        setUpcoming(data.data.upcoming || [])
      } catch (err) {
        console.error('Failed to fetch movies:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter now playing by genre
  const filteredNowPlaying = nowPlaying.filter((m) => {
    if (activeGenre === 'All') return true
    return m.genres?.some((g) => (g.name || g).toLowerCase() === activeGenre.toLowerCase())
  })

  return (
    <div className={styles.homePage}>
      {/* Hero */}
      {loading ? (
        <div className={styles.heroSkeleton}>
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
      ) : (
        <HeroSlider
          movies={trending.slice(0, 5)}
          onWatchTrailer={(key) => setActiveTrailer(key)}
        />
      )}

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { label: 'Blockbuster Titles', value: '10,000+' },
              { label: 'Luxury Theatres', value: '500+' },
              { label: 'Metropolitan Cities', value: '50+' },
              { label: 'Delighted Cinephiles', value: '2M+' },
            ].map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div>
            {[1, 2].map((i) => (
              <section key={i} className={styles.section}>
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '28px', borderRadius: '8px' }} />
                <div className="movies-grid">
                  {Array.from({ length: 6 }).map((_, j) => <SkeletonCard key={j} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <>
            {/* Now Showing with interactive Genre Tabs */}
            <Section
              title="Now Showing In Theatres"
              movies={filteredNowPlaying.slice(0, 12)}
              viewAll="/movies?status=Now+Showing"
              icon={Zap}
              extraHeader={
                <div className={styles.genreFilterWrap}>
                  {GENRE_FILTERS.map((g) => (
                    <button
                      key={g}
                      className={`${styles.genreFilterBtn} ${activeGenre === g ? styles.genreFilterBtnActive : ''}`}
                      onClick={() => setActiveGenre(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              }
            />

            {/* Trending Blockbusters */}
            <Section
              title="Trending This Week"
              movies={trending.slice(0, 12)}
              viewAll="/movies"
              icon={TrendingUp}
            />

            {/* Luxury Experiences */}
            <section className={styles.experiences}>
              <div className="section-header">
                <div className="flex gap-12" style={{ alignItems: 'center' }}>
                  <Sparkles size={22} color="var(--primary)" />
                  <h2 className="section-title" style={{ paddingLeft: 0 }}>Cinematic Formats</h2>
                </div>
                <Link to="/theatres" className={styles.viewAll}>Explore All Cinemas →</Link>
              </div>

              <div className={styles.expGrid}>
                {[
                  { badge: 'IMAX Laser', title: 'IMAX 3D with Laser', desc: 'Next-generation laser projection and precision multi-channel audio for unmatched realism.' },
                  { badge: 'Motion FX', title: '4DX Dynamic Motion', desc: 'Syncs dynamic motion seats with environmental effects like wind, fog, and light bursts.' },
                  { badge: 'Object Audio', title: 'Dolby Atmos 7.1', desc: 'Sound that flows all around you with breathtaking realism, placing you inside the movie scene.' },
                  { badge: 'VIP Lounges', title: 'Gold Class Dining', desc: 'Plush leather recliners, personal service, and chef-curated gourmet treats served at your seat.' },
                ].map((exp) => (
                  <div key={exp.title} className={styles.expCard} onClick={() => navigate('/theatres')} style={{ cursor: 'pointer' }}>
                    <span className={styles.expBadge}>{exp.badge}</span>
                    <h3 className={styles.expTitle}>{exp.title}</h3>
                    <p className={styles.expDesc}>{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Coming Soon */}
            <Section
              title="Coming Soon to Cinemas"
              movies={upcoming.slice(0, 12)}
              viewAll="/movies?status=Coming+Soon"
              icon={Calendar}
            />
          </>
        )}

        {/* Features */}
        <section className={styles.features}>
          <h2 className="section-title" style={{ textAlign: 'center', paddingLeft: 0, marginBottom: '48px' }}>
            Why Choose IMovies?
          </h2>
          <div className={styles.featuresGrid}>
            {[
              { icon: '🎬', title: 'Real-Time Live Seat Sync', desc: 'Interactive real-time seating map powered by WebSockets. Instant reservations with zero collision.' },
              { icon: '💳', title: 'Stripe Secured Payments', desc: 'Encrypted multi-currency checkout supporting credit/debit cards, Apple Pay, and UPI.' },
              { icon: '🎟️', title: 'Digital QR Tickets', desc: 'Instant access pass generated upon booking. Check-in directly from your smartphone.' },
              { icon: '🌟', title: 'TMDb & OMDb Powered', desc: 'Live trailers, critic ratings, verified cast, and high-definition official artwork.' },
              { icon: '🏟️', title: '500+ Luxury Theatres', desc: 'Partnered with premier IMAX, 4DX, and Dolby Atmos screens nationwide.' },
              { icon: '⚡', title: 'Lightning Fast Booking', desc: 'Streamlined checkout designed to book your tickets in under 30 seconds.' },
            ].map((feat) => (
              <div key={feat.title} className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureIcon}>{feat.icon}</div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {activeTrailer && (
        <div className={styles.trailerModal} onClick={() => setActiveTrailer(null)}>
          <div className={styles.trailerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.trailerClose} onClick={() => setActiveTrailer(null)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
              title="Movie Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className={styles.trailerFrame}
            />
          </div>
        </div>
      )}
    </div>
  )
}
