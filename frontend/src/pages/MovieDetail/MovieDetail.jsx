import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { movieAPI, showAPI } from '../../services/api'
import { Star, Clock, Play, Calendar, Globe, Award, ChevronRight, Film, MapPin } from 'lucide-react'
import styles from './MovieDetail.module.css'

const PLACEHOLDER_IMG = 'https://via.placeholder.com/500x750/0f172a/2563eb?text=No+Poster'

export default function MovieDetailPage() {
  const { id, tmdbId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showsLoading, setShowsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [trailerOpen, setTrailerOpen] = useState(false)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        let res
        if (tmdbId) {
          res = await movieAPI.getDetails(tmdbId)
        } else {
          res = await movieAPI.getById(id)
        }
        setMovie(res.data.data)
        setSelectedDate(dates[0].toISOString().split('T')[0])
      } catch (err) {
        console.error('Movie not found:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id, tmdbId])

  useEffect(() => {
    if (!movie || !selectedDate) return
    const fetchShows = async () => {
      setShowsLoading(true)
      try {
        const params = { movieId: movie._id, date: selectedDate }
        const { data } = await showAPI.getShows(params)
        setShows(data.data || [])
      } catch { setShows([]) }
      setShowsLoading(false)
    }
    fetchShows()
  }, [movie, selectedDate])

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className={styles.loadingWrap}>
          <div className={styles.backdropSkeleton + ' skeleton'} />
          <div className="container" style={{ paddingTop: 60 }}>
            <div style={{ display: 'flex', gap: 32 }}>
              <div className="skeleton" style={{ width: 220, height: 330, borderRadius: 16, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 48, marginBottom: 16, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 100, marginBottom: 16, borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: 16 }}>
        <Film size={60} color="var(--text-muted)" />
        <h2>Movie not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/movies')}>Browse Movies</button>
      </div>
    )
  }

  const rating = movie.tmdbRating || 0
  const imdbRating = movie.imdbRating

  return (
    <div className={styles.detailPage}>
      {/* Backdrop */}
      <div className={styles.backdrop}>
        <img
          src={movie.backdropPath || movie.posterPath || PLACEHOLDER_IMG}
          alt={movie.title}
          onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
        />
        <div className={styles.backdropGradient} />
      </div>

      <div className="page-wrapper">
        <div className={`container ${styles.mainContent}`}>
          {/* Left: Poster */}
          <div className={styles.posterSection}>
            <div className={styles.poster}>
              <img
                src={movie.posterPath || PLACEHOLDER_IMG}
                alt={movie.title}
                onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
              />
            </div>
            {/* Ratings */}
            <div className={styles.ratingsBlock}>
              {rating > 0 && (
                <div className={styles.ratingBox}>
                  <Star size={20} fill="#f5c518" color="#f5c518" />
                  <div>
                    <div className={styles.ratingVal}>{Number(rating).toFixed(1)}<span>/10</span></div>
                    <div className={styles.ratingLabel}>TMDb Rating</div>
                  </div>
                </div>
              )}
              {imdbRating && imdbRating !== 'N/A' && (
                <div className={styles.ratingBox}>
                  <div className={styles.imdbLogo}>IMDb</div>
                  <div>
                    <div className={styles.ratingVal}>{imdbRating}<span>/10</span></div>
                    <div className={styles.ratingLabel}>IMDb Rating</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className={styles.infoSection}>
            <div className={styles.certBadge}>{movie.certification || 'U/A'}</div>
            <h1 className={styles.movieTitle}>{movie.title}</h1>
            {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}

            <div className={styles.metaRow}>
              {movie.runtime && (
                <span className={styles.metaItem}>
                  <Clock size={15} /> {movie.runtime} min
                </span>
              )}
              {movie.releaseDate && (
                <span className={styles.metaItem}>
                  <Calendar size={15} />
                  {new Date(movie.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {movie.director && (
                <span className={styles.metaItem}>
                  <Film size={15} /> Dir: {movie.director}
                </span>
              )}
            </div>

            <div className={styles.genres}>
              {movie.genres?.map((g, i) => (
                <span key={i} className="genre-badge">{g.name}</span>
              ))}
              {movie.languages?.map((l, i) => (
                <span key={i} className={styles.langBadge}>
                  <Globe size={11} /> {l.english_name || l.name}
                </span>
              ))}
            </div>

            <p className={styles.overview}>{movie.overview}</p>

            {movie.awards && movie.awards !== 'N/A' && (
              <div className={styles.awards}>
                <Award size={16} color="var(--secondary)" />
                <span>{movie.awards}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className={styles.actionBtns}>
              {movie.trailerKey && (
                <button className="btn btn-ghost btn-lg" onClick={() => setTrailerOpen(true)}>
                  <Play size={18} /> Watch Trailer
                </button>
              )}
            </div>

            {/* Cast */}
            {movie.cast?.length > 0 && (
              <div className={styles.castSection}>
                <h3 className={styles.subTitle}>Cast</h3>
                <div className={styles.castScroll}>
                  {movie.cast?.slice(0, 8).map((c, i) => (
                    <div key={i} className={styles.castCard}>
                      <div className={styles.castImg}>
                        <img
                          src={c.profilePath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                          alt={c.name}
                          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}` }}
                        />
                      </div>
                      <div className={styles.castName}>{c.name}</div>
                      <div className={styles.castChar}>{c.character}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shows Section */}
        <div className={`container ${styles.showsSection}`}>
          <h2 className={styles.showsTitle}>
            <MapPin size={22} color="var(--primary)" />
            Book Tickets
          </h2>

          {/* Date Picker */}
          <div className={styles.datePicker}>
            {dates.map((d) => {
              const dateStr = d.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              const isToday = d.toDateString() === new Date().toDateString()
              return (
                <button
                  key={dateStr}
                  className={`${styles.dateBtn} ${isSelected ? styles.dateBtnActive : ''}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className={styles.dateDayName}>{isToday ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' })}</span>
                  <span className={styles.dateDay}>{d.getDate()}</span>
                  <span className={styles.dateMonth}>{d.toLocaleDateString('en', { month: 'short' })}</span>
                </button>
              )
            })}
          </div>

          {showsLoading ? (
            <div className={styles.showsLoading}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 12 }} />
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className={styles.noShows}>
              <Film size={48} color="var(--text-muted)" />
              <p>No shows available for selected date</p>
            </div>
          ) : (
            <div className={styles.theatreList}>
              {shows.map((group, i) => (
                <div key={i} className={`${styles.theatreCard} glass-card`}>
                  <div className={styles.theatreHeader}>
                    <div>
                      <h3 className={styles.theatreName}>{group.theatre?.name}</h3>
                      <p className={styles.theatreAddr}>
                        <MapPin size={12} />
                        {group.theatre?.address?.street}, {group.theatre?.address?.city}
                      </p>
                    </div>
                    <div className={styles.amenities}>
                      {group.theatre?.amenities?.slice(0, 3).map((a, j) => (
                        <span key={j} className={styles.amenityTag}>{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.showTimes}>
                    {group.shows?.map((show, j) => (
                      <button
                        key={j}
                        className={styles.showTimeBtn}
                        onClick={() => navigate(`/booking/${show._id}`)}
                        disabled={show.availableSeats === 0}
                      >
                        <span className={styles.showTime}>{show.startTime}</span>
                        <span className={styles.showFormat}>{show.format}</span>
                        <span className={`${styles.showSeats} ${show.availableSeats < 20 ? styles.lowSeats : ''}`}>
                          {show.availableSeats === 0 ? 'SOLD OUT' : `${show.availableSeats} seats`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && movie.trailerKey && (
        <div className={styles.trailerModal} onClick={() => setTrailerOpen(false)}>
          <div className={styles.trailerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.trailerClose} onClick={() => setTrailerOpen(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Trailer"
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
