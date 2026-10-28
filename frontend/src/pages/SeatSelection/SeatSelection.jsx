import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { seatAPI, showAPI } from '../../services/api'
import { toggleSeat, clearSeats, setSelectedShow } from '../../store/slices/bookingSlice'
import { toast } from 'react-toastify'
import { Info, ArrowRight, RotateCcw } from 'lucide-react'
import styles from './SeatSelection.module.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function SeatSelectionPage() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((s) => s.auth)
  const { selectedSeats } = useSelector((s) => s.booking)

  const [show, setShow] = useState(null)
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveReserved, setLiveReserved] = useState([])
  const [liveBooked, setLiveBooked] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${showId}` } })
      return
    }

    const fetchData = async () => {
      try {
        const [showRes, layoutRes] = await Promise.all([
          showAPI.getById(showId),
          seatAPI.getLayout(showId),
        ])
        setShow(showRes.data.data)
        setLayout(layoutRes.data.data)
        setLiveBooked(layoutRes.data.data.bookedSeats || [])
        setLiveReserved(layoutRes.data.data.reservedSeats?.map((r) => r.seatNumber) || [])
        dispatch(setSelectedShow(showRes.data.data))
      } catch (err) {
        toast.error('Failed to load seat layout')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Connect socket for real-time updates
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-show', showId)
    })

    socket.on('seats-reserved', ({ seats }) => {
      setLiveReserved((prev) => [...new Set([...prev, ...seats])])
    })

    socket.on('seats-booked', ({ seats }) => {
      setLiveBooked((prev) => [...new Set([...prev, ...seats])])
      setLiveReserved((prev) => prev.filter((s) => !seats.includes(s)))
    })

    socket.on('seat-deselected', ({ seatNumber }) => {
      setLiveReserved((prev) => prev.filter((s) => s !== seatNumber))
    })

    return () => {
      socket.emit('leave-show', showId)
      socket.disconnect()
    }
  }, [showId, isAuthenticated])

  const getSeatStatus = (seatNum) => {
    if (liveBooked.includes(seatNum)) return 'booked'
    if (liveReserved.includes(seatNum)) return 'reserved'
    if (selectedSeats.find((s) => s.seatNumber === seatNum)) return 'selected'
    return 'available'
  }

  const getSeatType = (rowLetter, sections) => {
    for (const section of sections || []) {
      if (section.rows?.includes(rowLetter)) return section.name.toLowerCase()
    }
    return 'silver'
  }

  const getSeatPrice = (seatType) => {
    if (!layout?.pricing) return 150
    const price = {
      silver: layout.pricing.silver || 150,
      gold: layout.pricing.gold || 250,
      platinum: layout.pricing.platinum || 400,
    }
    return price[seatType] || 150
  }

  const handleSeatClick = (seatNum, rawSeatType) => {
    const status = getSeatStatus(seatNum)
    if (status === 'booked' || status === 'reserved') return
    if (status === 'available' && selectedSeats.length >= 8) {
      toast.warn('Max 8 seats per booking')
      return
    }
    const seatType = rawSeatType ? rawSeatType.charAt(0).toUpperCase() + rawSeatType.slice(1).toLowerCase() : 'Silver'
    const price = getSeatPrice(seatType.toLowerCase())
    dispatch(toggleSeat({ seatNumber: seatNum, seatType, price }))

    // Broadcast to other users
    if (socketRef.current) {
      socketRef.current.emit(
        status === 'selected' ? 'seat-deselect' : 'seat-select',
        { showId, seatNumber: seatNum }
      )
    }
  }

  const totalAmount = selectedSeats.reduce((s, seat) => s + seat.price, 0)
  const convenienceFee = Math.round(totalAmount * 0.02)
  const taxes = Math.round(totalAmount * 0.18)
  const finalAmount = totalAmount + convenienceFee + taxes

  const handleProceed = () => {
    if (!selectedSeats.length) {
      toast.warn('Please select at least 1 seat')
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: 16 }}>
        <div className={styles.loadingSpinner} />
        <p style={{ color: 'var(--text-muted)' }}>Loading seat layout...</p>
      </div>
    )
  }

  // Build rows from A to (A + rows-1)
  const totalRows = layout?.rows || 10
  const totalCols = layout?.cols || 15
  const rowLetters = Array.from({ length: totalRows }, (_, i) => String.fromCharCode(65 + i))
  
  const silverCount = Math.max(1, Math.floor(totalRows * 0.5))
  const goldCount = Math.max(1, Math.floor(totalRows * 0.3))
  const defaultSections = [
    { name: 'Silver', rows: rowLetters.slice(0, silverCount) },
    { name: 'Gold', rows: rowLetters.slice(silverCount, silverCount + goldCount) },
    { name: 'Platinum', rows: rowLetters.slice(silverCount + goldCount) },
  ].filter((s) => s.rows && s.rows.length > 0)

  const sections = (layout?.sections && layout.sections.length > 0)
    ? layout.sections
    : defaultSections

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Show info header */}
        <div className={styles.showHeader}>
          {show?.movie && (
            <div className={styles.showMovieInfo}>
              <img
                src={show.movie.posterPath || '/placeholder.jpg'}
                alt={show.movie.title}
                className={styles.showPoster}
              />
              <div>
                <h1 className={styles.showMovieTitle}>{show.movie.title}</h1>
                <div className={styles.showMeta}>
                  <span>{show.theatre?.name}</span>
                  <span>•</span>
                  <span>{new Date(show.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{show.startTime}</span>
                  <span>•</span>
                  <span>{show.language} | {show.format}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Screen */}
        <div className={styles.screenContainer}>
          <div className={styles.screen}><span>SCREEN</span></div>
          <div className={styles.screenGlow} />
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          {[
            { cls: 'available', label: 'Available' },
            { cls: 'selected', label: 'Selected' },
            { cls: 'reserved', label: 'Temporarily Reserved' },
            { cls: 'booked', label: 'Booked' },
          ].map(({ cls, label }) => (
            <div key={cls} className={styles.legendItem}>
              <div className={`seat ${cls}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Seat Map */}
        <div className={styles.seatMapOuter}>
          {sections.map((section) => (
            <div key={section.name} className={styles.sectionBlock}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionName}>{section.name}</span>
                <span className={styles.sectionPrice}>₹{getSeatPrice(section.name.toLowerCase())}</span>
              </div>
              <div className={styles.seatRows}>
                {section.rows?.map((row) => (
                  <div key={row} className={styles.seatRow}>
                    <span className={styles.rowLabel}>{row}</span>
                    <div className={styles.seats}>
                      {Array.from({ length: totalCols }, (_, col) => {
                        const seatNum = `${row}${col + 1}`
                        const status = getSeatStatus(seatNum)
                        return (
                          <div
                            key={seatNum}
                            className={`seat ${section.name.toLowerCase()} ${status}`}
                            onClick={() => handleSeatClick(seatNum, section.name.toLowerCase())}
                            title={seatNum}
                          >
                            {col + 1}
                          </div>
                        )
                      })}
                    </div>
                    <span className={styles.rowLabel}>{row}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Booking Summary Bar */}
        {selectedSeats.length > 0 && (
          <div className={styles.summaryBar}>
            <div className={styles.summaryInfo}>
              <div className={styles.summarySeats}>
                {selectedSeats.map((s) => (
                  <span key={s.seatNumber} className={styles.seatChip}>{s.seatNumber}</span>
                ))}
              </div>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryLine}>
                  <span>Subtotal ({selectedSeats.length} seats)</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>GST (18%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>
            </div>
            <div className={styles.summaryActions}>
              <button className="btn btn-ghost" onClick={() => dispatch(clearSeats())}>
                <RotateCcw size={16} /> Clear
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleProceed}>
                Proceed to Pay <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
