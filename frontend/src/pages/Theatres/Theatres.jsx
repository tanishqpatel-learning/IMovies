import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { theatreAPI } from '../../services/api'
import { MapPin, Film, Star, Sparkles, Search, Tv, Coffee, Car, Armchair, ChevronRight } from 'lucide-react'
import styles from './Theatres.module.css'

const CITIES = ['All', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Hyderabad', 'Pune']

export default function TheatresPage() {
  const navigate = useNavigate()
  const [theatres, setTheatres] = useState([])
  const [selectedCity, setSelectedCity] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTheatres()
  }, [selectedCity])

  const fetchTheatres = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCity !== 'All') {
        params.city = selectedCity
      }
      const res = await theatreAPI.getAll(params)
      setTheatres(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load theatres:', err)
      setTheatres([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTheatres = theatres.filter((th) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      th.name?.toLowerCase().includes(q) ||
      th.address?.street?.toLowerCase().includes(q) ||
      th.address?.city?.toLowerCase().includes(q) ||
      th.amenities?.some((a) => a.toLowerCase().includes(q))
    )
  })

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.theatresPage}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <Sparkles size={14} /> LUXURY CINEMA NETWORK
          </div>
          <h1 className={styles.title}>Cinemas & Multiplexes</h1>
          <p className={styles.subtitle}>
            Experience state-of-the-art IMAX Laser, 4DX motion auditoriums, and Dolby Atmos surround sound across premium destinations.
          </p>

          {/* Controls Bar */}
          <div className={styles.controlsBar}>
            <div className={styles.cityTabs}>
              {CITIES.map((city) => (
                <button
                  key={city}
                  className={`${styles.cityTab} ${selectedCity === city ? styles.cityTabActive : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search cinema or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.theatresGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 24 }} />
            ))}
          </div>
        ) : filteredTheatres.length === 0 ? (
          <div className={styles.emptyState}>
            <Film size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <h3>No cinemas found in this location</h3>
            <p>Try switching cities or adjusting your search term.</p>
          </div>
        ) : (
          <div className={styles.theatresGrid}>
            {filteredTheatres.map((theatre) => {
              const formats = Array.from(
                new Set(theatre.screens?.map((s) => s.screenType).filter(Boolean))
              )

              return (
                <div key={theatre._id} className={styles.theatreCard}>
                  {/* Banner */}
                  <div className={styles.theatreBanner}>
                    <img
                      src={theatre.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'}
                      alt={theatre.name}
                      className={styles.theatreBannerImg}
                    />
                    <div className={styles.theatreBannerOverlay} />
                    <div className={styles.theatreRatingBadge}>
                      <Star size={13} fill="#f5c518" color="#f5c518" />
                      {theatre.rating || 4.8}
                    </div>
                    <div className={styles.theatreHeaderInfo}>
                      <h2 className={styles.theatreName}>{theatre.name}</h2>
                      <span className={styles.theatreCityTag}>
                        <MapPin size={13} color="var(--primary)" />
                        {theatre.address?.city}, {theatre.address?.state}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className={styles.theatreBody}>
                    <div className={styles.addressRow}>
                      <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{theatre.address?.street}, {theatre.address?.pincode}</span>
                    </div>

                    <div className={styles.screensInfo}>
                      <div className={styles.screenCount}>
                        <Tv size={16} color="var(--primary)" />
                        <span>{theatre.screens?.length || 4} Cinema Screens</span>
                      </div>
                      <div className={styles.screenFormats}>
                        {formats.length > 0 ? (
                          formats.map((f, i) => (
                            <span key={i} className={styles.formatBadge}>{f}</span>
                          ))
                        ) : (
                          <>
                            <span className={styles.formatBadge}>IMAX</span>
                            <span className={styles.formatBadge}>4DX</span>
                            <span className={styles.formatBadge}>ATMOS</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className={styles.amenitiesList}>
                      {(theatre.amenities?.length ? theatre.amenities : [
                        'IMAX with Laser',
                        'Dolby Atmos 7.1',
                        'VIP Recliners',
                        'Gourmet Dining',
                        'Valet Parking',
                      ]).slice(0, 5).map((amenity, i) => (
                        <span key={i} className={styles.amenityChip}>
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => navigate('/movies')}
                      >
                        Explore Shows & Book <ChevronRight size={16} />
                      </button>
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
