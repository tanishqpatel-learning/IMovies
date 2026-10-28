import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bookingAPI } from '../../services/api'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Ticket, Calendar, Clock, MapPin, AlertCircle, ChevronRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import styles from './Bookings.module.css'

export default function BookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'Confirmed' | 'Cancelled'
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.getMyBookings()
      setBookings(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load your booking history')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCancel = (b) => {
    setSelectedBooking(b)
    setCancelReason('')
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return
    setCancellingId(selectedBooking._id)
    try {
      await bookingAPI.cancel(selectedBooking._id, cancelReason || 'User requested cancellation')
      toast.success('Booking cancelled successfully')
      setCancelModalOpen(false)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true
    return b.bookingStatus === filter
  })

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.bookingsPage}`}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Movie Tickets</h1>
            <p className={styles.subtitle}>
              Manage your cinema reservations, view boarding passes, and access digital tickets.
            </p>
          </div>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tickets ({bookings.length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'Confirmed' ? styles.filterActive : ''}`}
              onClick={() => setFilter('Confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'Cancelled' ? styles.filterActive : ''}`}
              onClick={() => setFilter('Cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className="spinner" />
            <p>Loading your tickets...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <Ticket size={48} />
            </div>
            <h3>No Bookings Found</h3>
            <p>
              {filter === 'all'
                ? "You haven't booked any cinema tickets yet. Catch the latest blockbusters now!"
                : `No ${filter.toLowerCase()} bookings found.`}
            </p>
            <Link to="/movies" className="btn btn-primary btn-lg">
              Explore Now Showing Movies
            </Link>
          </div>
        ) : (
          <div className={styles.ticketsGrid}>
            {filteredBookings.map((b) => {
              const movie = b.movie || {}
              const show = b.show || {}
              const theatre = show.theatre || b.theatre || {}
              const isConfirmed = b.bookingStatus === 'Confirmed'
              const isCancelled = b.bookingStatus === 'Cancelled'
              const showDate = b.showDetails?.date || show.date
              const formattedDate = showDate
                ? format(new Date(showDate), 'EEE, dd MMM yyyy')
                : 'Upcoming'

              const seatList = b.seats?.map((s) => s.seatNumber).join(', ')

              return (
                <div key={b._id} className={`${styles.ticketCard} ${isCancelled ? styles.ticketCancelled : ''}`}>
                  {/* Status Banner */}
                  <div className={styles.cardHeader}>
                    <div className={styles.refWrap}>
                      <span className={styles.refLabel}>Booking ID</span>
                      <span className={styles.refCode}>{b.bookingRef || b._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className={`${styles.statusBadge} ${isConfirmed ? styles.statusConfirmed : styles.statusCancel}`}>
                      {isConfirmed && <CheckCircle2 size={13} />}
                      {isCancelled && <XCircle size={13} />}
                      <span>{b.bookingStatus}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.posterSide}>
                      <img
                        src={movie.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80'}
                        alt={movie.title || 'Movie'}
                        className={styles.poster}
                      />
                    </div>

                    <div className={styles.infoSide}>
                      <h3 className={styles.movieTitle}>{movie.title || 'Cinema Feature'}</h3>

                      <div className={styles.theatreName}>
                        <MapPin size={14} className={styles.pinIcon} />
                        <span>{theatre.name || 'IMovies Cinema'}, Screen {b.showDetails?.screenNumber || show.screenNumber || 1}</span>
                      </div>

                      <div className={styles.dateTimeGrid}>
                        <div className={styles.infoPill}>
                          <Calendar size={13} />
                          <span>{formattedDate}</span>
                        </div>
                        <div className={styles.infoPill}>
                          <Clock size={13} />
                          <span>{b.showDetails?.startTime || show.startTime || '18:30'}</span>
                        </div>
                        <div className={styles.infoPill}>
                          <span>{b.showDetails?.format || show.format || '2D'} • {b.showDetails?.language || show.language || 'English'}</span>
                        </div>
                      </div>

                      <div className={styles.seatsRow}>
                        <span className={styles.seatsLabel}>Seats ({b.seats?.length}):</span>
                        <div className={styles.seatPills}>
                          {b.seats?.map((s) => (
                            <span key={s.seatNumber} className={styles.seatPill}>
                              {s.seatNumber}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={styles.priceRow}>
                        <div>
                          <span className={styles.priceLabel}>Total Paid</span>
                          <span className={styles.priceValue}>₹{b.finalAmount || b.totalAmount}</span>
                        </div>
                        <span className={styles.paymentMethod}>Paid via Stripe</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className={styles.cardFooter}>
                    <button
                      className={`btn btn-secondary ${styles.actionBtn}`}
                      onClick={() => navigate(`/bookings/${b._id}`)}
                    >
                      <Ticket size={15} /> View Digital Pass & QR
                    </button>

                    {isConfirmed && (
                      <button
                        className={`btn btn-ghost ${styles.cancelBtn}`}
                        onClick={() => handleOpenCancel(b)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancelModalOpen && selectedBooking && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.modalWarningIcon}>
                  <AlertCircle size={28} />
                </div>
                <h3>Cancel Cinema Ticket?</h3>
              </div>

              <p className={styles.modalText}>
                Are you sure you want to cancel your booking for{' '}
                <strong>{selectedBooking.movie?.title}</strong> (Booking Ref:{' '}
                {selectedBooking.bookingRef})?
              </p>

              <div className={styles.refundInfo}>
                <span>Refundable Amount:</span>
                <strong>₹{selectedBooking.finalAmount}</strong>
              </div>

              <div className={styles.inputGroup}>
                <label>Reason for cancellation (optional):</label>
                <textarea
                  rows="3"
                  placeholder="Change of plans, reschedule..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={cancellingId}
                >
                  Keep Ticket
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCancel}
                  disabled={cancellingId}
                >
                  {cancellingId ? 'Processing Refund...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
