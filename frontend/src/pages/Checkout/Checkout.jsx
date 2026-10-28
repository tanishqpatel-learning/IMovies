import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { bookingAPI, paymentAPI } from '../../services/api'
import { setCurrentBooking, resetBooking } from '../../store/slices/bookingSlice'
import { toast } from 'react-toastify'
import { Shield, CreditCard, CheckCircle, ArrowLeft, Ticket } from 'lucide-react'
import styles from './Checkout.module.css'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51UUjEEJ48NHEyGGMr5dOdtCAlbLaqqdkThcGE3YMc6Wl6UiUQkNwAVEFaENIh4uJVHhBpzj71CcL3UQ6IOYngVXX0098TZJ1V4'
)

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#7b2cbf',
    colorBackground: '#160d20',
    colorText: '#fffaff',
    colorDanger: '#fb7185',
    fontFamily: 'Outfit, Inter, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid rgba(255,255,255,0.08)', padding: '14px 18px' },
    '.Input:focus': { border: '1px solid #7b2cbf', boxShadow: '0 0 0 3px rgba(123,44,191,0.2)' },
    '.Label': { color: '#b3b3b3', fontWeight: '500', marginBottom: '6px' },
    '.Tab': { border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#160d20' },
    '.Tab--selected': { borderColor: '#7b2cbf', backgroundColor: 'rgba(123,44,191,0.1)' },
  },
}

function PaymentForm({ clientSecret, booking, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        setProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm on backend
        await paymentAPI.confirm(paymentIntent.id)
        toast.success('Payment successful! Booking confirmed 🎉')
        dispatch(resetBooking())
        onSuccess(booking._id)
      }
    } catch (err) {
      toast.error('Payment processing error. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.paymentElementWrap}>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className={styles.securityNote}>
        <Shield size={14} />
        <span>Your payment is secured by Stripe. We never store card details.</span>
      </div>

      <button
        type="submit"
        className={`btn btn-primary btn-lg w-full ${styles.payBtn}`}
        disabled={processing || !stripe}
      >
        {processing ? (
          <><div className={styles.btnSpinner} /> Processing Payment...</>
        ) : (
          <><CreditCard size={18} /> Pay ₹{booking?.finalAmount}</>
        )}
      </button>
    </form>
  )
}

function MockPaymentForm({ clientSecret, booking, onSuccess }) {
  const [processing, setProcessing] = useState(false)
  const dispatch = useDispatch()

  const handleSimulatePayment = async () => {
    setProcessing(true)
    try {
      const parts = clientSecret.split('_secret_')
      const mockIntentId = parts[0].replace('mock_secret_', 'mock_pi_')
      await paymentAPI.confirm(mockIntentId)
      toast.success('Test payment successful! Booking confirmed 🎉')
      dispatch(resetBooking())
      onSuccess(booking._id)
    } catch (err) {
      toast.error('Simulation payment error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', padding: '16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>
          <Shield size={16} /> Stripe Sandbox Simulation Mode
        </div>
        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5, margin: 0 }}>
          Live Stripe keys can be configured in backend .env. In test mode, you can test the complete ticket booking lifecycle with instant simulated confirmation.
        </p>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Test Card Simulation</div>
        <div style={{ fontSize: '15px', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px' }}>•••• •••• •••• 4242</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
          <span>Expires: 12/28</span>
          <span>CVC: 123</span>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg w-full"
        onClick={handleSimulatePayment}
        disabled={processing}
      >
        {processing ? 'Confirming Booking...' : `Simulate Stripe Pay ₹${booking?.finalAmount}`}
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedSeats, selectedShow, selectedMovie } = useSelector((s) => s.booking)
  const { user } = useSelector((s) => s.auth)

  const [step, setStep] = useState('review') // 'review' | 'payment' | 'success'
  const [booking, setBooking] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successBookingId, setSuccessBookingId] = useState(null)

  // Redirect if no seats selected
  useEffect(() => {
    if (!selectedSeats.length || !selectedShow) {
      navigate(-1)
    }
  }, [])

  if (!selectedSeats.length || !selectedShow) return null

  const totalAmount = selectedSeats.reduce((s, seat) => s + seat.price, 0)
  const convenienceFee = Math.round(totalAmount * 0.02)
  const taxes = Math.round(totalAmount * 0.18)
  const finalAmount = totalAmount + convenienceFee + taxes

  const handleCreateBooking = async () => {
    setLoading(true)
    try {
      const normalizedSeats = selectedSeats.map((s) => ({
        ...s,
        seatType: s.seatType
          ? s.seatType.charAt(0).toUpperCase() + s.seatType.slice(1).toLowerCase()
          : 'Silver',
      }))

      // Create booking
      const bookingRes = await bookingAPI.create({
        showId: selectedShow._id,
        movieId: selectedShow.movie?._id || selectedShow.movie,
        theatreId: selectedShow.theatre?._id || selectedShow.theatre,
        seats: normalizedSeats,
      })
      const newBooking = { ...bookingRes.data.data, finalAmount }
      setBooking(newBooking)
      dispatch(setCurrentBooking(newBooking))

      // Create Stripe payment intent
      const intentRes = await paymentAPI.createIntent({
        bookingId: newBooking._id,
        amount: finalAmount,
        currency: 'inr',
      })
      setClientSecret(intentRes.data.clientSecret)
      setStep('payment')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (bookingId) => {
    setSuccessBookingId(bookingId)
    setStep('success')
  }

  const movie = selectedShow.movie
  const theatre = selectedShow.theatre

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.checkoutPage}`}>
        {/* Steps */}
        <div className={styles.steps}>
          {['review', 'payment', 'success'].map((s, i) => (
            <div key={s} className={`${styles.step} ${step === s ? styles.stepActive : ''} ${['review', 'payment', 'success'].indexOf(step) > i ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{i + 1}</div>
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* Success State */}
        {step === 'success' && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h2 className={styles.successTitle}>Booking Confirmed! 🎉</h2>
            <p className={styles.successMsg}>
              Your tickets have been booked successfully. Check your email for the e-ticket.
            </p>
            <div className={styles.successBtns}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/bookings/${successBookingId}`)}>
                <Ticket size={18} /> View Ticket
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/bookings')}>
                My Bookings
              </button>
            </div>
          </div>
        )}

        {step !== 'success' && (
          <div className={styles.checkoutGrid}>
            {/* Left: Order Summary */}
            <div className={styles.summaryCard + ' glass-card'}>
              <h2 className={styles.cardTitle}>Order Summary</h2>

              <div className={styles.movieInfo}>
                <img
                  src={movie?.posterPath || '/placeholder.jpg'}
                  alt={movie?.title}
                  className={styles.moviePosterThumb}
                  onError={(e) => { e.target.src = '/placeholder.jpg' }}
                />
                <div>
                  <div className={styles.movieName}>{movie?.title || selectedShow.movie?.title}</div>
                  <div className={styles.showInfoText}>
                    <div>{theatre?.name || 'Theatre'}</div>
                    <div>{new Date(selectedShow.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {selectedShow.startTime}</div>
                    <div>{selectedShow.language} | {selectedShow.format} | Screen {selectedShow.screenNumber}</div>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* Seats */}
              <div className={styles.seatsSection}>
                <div className={styles.seatsLabel}>Selected Seats</div>
                <div className={styles.seatsChips}>
                  {selectedSeats.map((s) => (
                    <span key={s.seatNumber} className={`${styles.seatChipSummary} ${styles[s.seatType] || styles[s.seatType?.toLowerCase()]}`}>
                      {s.seatNumber}
                    </span>
                  ))}
                </div>
                <div className={styles.seatsBreakdown}>
                  {selectedSeats.map((s) => (
                    <div key={s.seatNumber} className={styles.seatLine}>
                      <span>{s.seatNumber} ({s.seatType})</span>
                      <span>₹{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider" />

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceLine}><span>Subtotal</span><span>₹{totalAmount}</span></div>
                <div className={styles.priceLine}><span>Convenience Fee (2%)</span><span>₹{convenienceFee}</span></div>
                <div className={styles.priceLine}><span>GST (18%)</span><span>₹{taxes}</span></div>
                <div className={`${styles.priceLine} ${styles.priceTotal}`}>
                  <span>Total Amount</span><span>₹{finalAmount}</span>
                </div>
              </div>

              {step === 'review' && (
                <button
                  className={`btn btn-primary btn-lg w-full ${styles.continueBtn}`}
                  onClick={handleCreateBooking}
                  disabled={loading}
                >
                  {loading ? 'Creating Booking...' : 'Continue to Payment →'}
                </button>
              )}
            </div>

            {/* Right: Payment */}
            <div className={styles.paymentCard + ' glass-card'}>
              {step === 'review' && (
                <div className={styles.reviewSection}>
                  <h2 className={styles.cardTitle}>User Details</h2>
                  <div className={styles.userInfo}>
                    <div className={styles.userRow}><span>Name</span><strong>{user?.name}</strong></div>
                    <div className={styles.userRow}><span>Email</span><strong>{user?.email}</strong></div>
                    {user?.phone && <div className={styles.userRow}><span>Phone</span><strong>{user?.phone}</strong></div>}
                  </div>
                  <div className={styles.infoNote}>
                    <Shield size={16} color="var(--primary)" />
                    <span>Booking confirmation will be sent to your email</span>
                  </div>
                </div>
              )}

              {step === 'payment' && clientSecret && (
                <>
                  <div className={styles.paymentHeader}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                      <CreditCard size={20} /> Secure Payment
                    </h2>
                  </div>
                  {clientSecret.startsWith('mock_') ? (
                    <MockPaymentForm
                      clientSecret={clientSecret}
                      booking={{ ...booking, finalAmount }}
                      onSuccess={handleSuccess}
                    />
                  ) : (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                    >
                      <PaymentForm
                        clientSecret={clientSecret}
                        booking={{ ...booking, finalAmount }}
                        onSuccess={handleSuccess}
                      />
                    </Elements>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
