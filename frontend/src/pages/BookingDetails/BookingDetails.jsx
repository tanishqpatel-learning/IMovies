import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bookingAPI } from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Film,
  Sparkles,
} from 'lucide-react'
import styles from './BookingDetails.module.css'

export default function BookingDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.getById(id)
      setBooking(res.data?.data)
    } catch (err) {
      toast.error('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className={styles.loadingBox}>
          <div className="spinner" />
          <p>Generating your digital ticket...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="page-wrapper">
        <div className={`container ${styles.errorBox}`}>
          <h2>Ticket Not Found</h2>
          <p>We could not find the requested booking reference.</p>
          <Link to="/bookings" className="btn btn-primary">
            View All Bookings
          </Link>
        </div>
      </div>
    )
  }

  const movie = booking.movie || {}
  const show = booking.show || {}
  const theatre = show.theatre || booking.theatre || {}
  const showDate = booking.showDetails?.date || show.date
  const formattedDate = showDate
    ? format(new Date(showDate), 'EEEE, MMMM dd, yyyy')
    : 'Upcoming'

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.ticketPage}`}>
        {/* Navigation & Controls */}
        <div className={styles.topBar}>
          <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => navigate('/bookings')}>
            <ArrowLeft size={16} /> Back to My Bookings
          </button>

          <button className={`btn btn-secondary ${styles.printBtn}`} onClick={handlePrint}>
            <Printer size={16} /> Print / Save E-Ticket
          </button>
        </div>

        {/* Digital Boarding Pass Ticket */}
        <div className={styles.ticketCard} id="printable-ticket">
          {/* Main Visual Side */}
          <div className={styles.ticketMain}>
            <div className={styles.header}>
              <div className={styles.brand}>
                <Film size={20} className={styles.brandIcon} />
                <span className={styles.brandName}>
                  I<span className={styles.highlight}>MOVIES</span> PASS
                </span>
              </div>
              <span className={styles.bookingRef}>
                REF: <strong>{booking.bookingRef}</strong>
              </span>
            </div>

            <div className={styles.movieSection}>
              <img
                src={movie.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                alt={movie.title}
                className={styles.poster}
              />
              <div className={styles.movieDetails}>
                <div className={styles.statusPill}>
                  <CheckCircle2 size={13} /> {booking.bookingStatus}
                </div>
                <h1 className={styles.movieTitle}>{movie.title || 'Cinema Feature'}</h1>
                <p className={styles.tagline}>{movie.tagline || 'Experience it on the biggest screens'}</p>

                <div className={styles.infoTags}>
                  <span className={styles.tag}>{booking.showDetails?.format || show.format || '2D'}</span>
                  <span className={styles.tag}>{booking.showDetails?.language || show.language || 'English'}</span>
                  <span className={styles.tag}>{movie.certification || 'U/A'}</span>
                  {movie.runtime && <span className={styles.tag}>{movie.runtime} min</span>}
                </div>
              </div>
            </div>

            {/* Theatre & Showtime Info */}
            <div className={styles.gridDetails}>
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Cinema & Location</span>
                <span className={styles.detailValue}>
                  <MapPin size={14} className={styles.pin} />
                  {theatre.name || 'IMovies Cineplex'}
                </span>
                <span className={styles.subDetail}>
                  {theatre.address?.street || 'Auditorium Gate 2'}, {theatre.address?.city || 'Downtown'}
                </span>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Date & Showtime</span>
                <span className={styles.detailValue}>
                  <Calendar size={14} className={styles.cal} />
                  {formattedDate}
                </span>
                <span className={styles.subDetail}>
                  <Clock size={12} /> Starts at {booking.showDetails?.startTime || show.startTime || '18:30'}
                </span>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Screen / Auditorium</span>
                <span className={styles.detailValue}>
                  Screen {booking.showDetails?.screenNumber || show.screenNumber || 1}
                </span>
                <span className={styles.subDetail}>IMAX with Laser Sound</span>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Assigned Seats</span>
                <div className={styles.seatPillList}>
                  {booking.seats?.map((s) => (
                    <span key={s.seatNumber} className={styles.seatPill}>
                      {s.seatNumber} ({s.seatType})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Barcode Visual */}
            <div className={styles.barcodeSection}>
              <div className={styles.barcodeLines}>
                {[...Array(48)].map((_, i) => (
                  <span
                    key={i}
                    className={styles.barcodeLine}
                    style={{
                      width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px',
                      opacity: i % 7 === 0 ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
              <span className={styles.barcodeNumber}>* {booking.bookingRef} *</span>
            </div>
          </div>

          {/* Notch divider */}
          <div className={styles.notchDivider}>
            <div className={styles.notchTop} />
            <div className={styles.dashLine} />
            <div className={styles.notchBottom} />
          </div>

          {/* Stub / QR Section */}
          <div className={styles.ticketStub}>
            <div className={styles.stubHeader}>
              <span className={styles.admitText}>ADMIT {booking.seats?.length || 1}</span>
              <span className={styles.stubFormat}>{booking.showDetails?.format || 'IMAX'}</span>
            </div>

            {/* QR Code SVG Display */}
            <div className={styles.qrWrap}>
              <svg viewBox="0 0 100 100" className={styles.qrSvg}>
                {/* SVG QR Code Simulation */}
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" rx="6" />
                {/* Corner Squares */}
                <rect x="10" y="10" width="22" height="22" fill="#000000" />
                <rect x="14" y="14" width="14" height="14" fill="#ffffff" />
                <rect x="18" y="18" width="6" height="6" fill="#000000" />

                <rect x="68" y="10" width="22" height="22" fill="#000000" />
                <rect x="72" y="14" width="14" height="14" fill="#ffffff" />
                <rect x="76" y="18" width="6" height="6" fill="#000000" />

                <rect x="10" y="68" width="22" height="22" fill="#000000" />
                <rect x="14" y="72" width="14" height="14" fill="#ffffff" />
                <rect x="18" y="76" width="6" height="6" fill="#000000" />

                {/* Random Pattern Modules */}
                <rect x="36" y="12" width="6" height="6" fill="#000000" />
                <rect x="46" y="12" width="6" height="6" fill="#000000" />
                <rect x="56" y="16" width="6" height="6" fill="#000000" />
                <rect x="36" y="24" width="6" height="6" fill="#000000" />
                <rect x="48" y="26" width="6" height="6" fill="#000000" />
                <rect x="12" y="42" width="6" height="6" fill="#000000" />
                <rect x="24" y="46" width="6" height="6" fill="#000000" />
                <rect x="36" y="40" width="16" height="6" fill="#000000" />
                <rect x="42" y="52" width="10" height="10" fill="#000000" />
                <rect x="60" y="42" width="8" height="8" fill="#000000" />
                <rect x="74" y="44" width="14" height="6" fill="#000000" />
                <rect x="36" y="66" width="8" height="8" fill="#000000" />
                <rect x="50" y="72" width="10" height="6" fill="#000000" />
                <rect x="68" y="68" width="6" height="12" fill="#000000" />
                <rect x="80" y="74" width="8" height="8" fill="#000000" />
              </svg>
              <span className={styles.scanNotice}>Scan at cinema turnstile</span>
            </div>

            <div className={styles.stubMeta}>
              <div className={styles.stubRow}>
                <span>Total Paid:</span>
                <strong>₹{booking.finalAmount}</strong>
              </div>
              <div className={styles.stubRow}>
                <span>Payment:</span>
                <span className={styles.stripeBadge}>
                  <ShieldCheck size={12} /> Stripe
                </span>
              </div>
              <div className={styles.stubRow}>
                <span>Holder:</span>
                <span>{booking.user?.name || 'Customer'}</span>
              </div>
            </div>

            <div className={styles.verifiedNotice}>
              <Sparkles size={13} color="#c77dff" />
              <span>Official IMovies Verified Pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
