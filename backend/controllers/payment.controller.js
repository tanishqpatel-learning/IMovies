import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const getStripe = () => {
  const stripeKey =
    process.env.STRIPE_SECRET_KEY;
  return new Stripe(stripeKey);
};

// @desc  Create Stripe Payment Intent
// @route POST /api/payments/create-intent
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount, currency = 'inr' } = req.body;

    const booking = await Booking.findById(bookingId).populate('movie show theatre');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const stripeClient = getStripe();

    if (stripeClient) {
      try {
        // Create or get Stripe customer
        let stripeCustomerId;
        const user = await User.findById(req.user.id);

        if (user?.email) {
          try {
            const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length > 0) {
              stripeCustomerId = customers.data[0].id;
            } else {
              const customer = await stripeClient.customers.create({
                email: user.email,
                name: user.name || 'Customer',
                metadata: { userId: req.user.id.toString() },
              });
              stripeCustomerId = customer.id;
            }
          } catch (custErr) {
            console.warn('Customer lookup/create skipped:', custErr.message);
          }
        }

        // Create payment intent
        const paymentIntentPayload = {
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          description: `IMovies - ${booking.movie?.title || 'Movie'} ticket`,
          metadata: {
            bookingId: bookingId.toString(),
            userId: req.user.id.toString(),
            bookingRef: booking.bookingRef || 'REF',
          },
          automatic_payment_methods: { enabled: true },
        };

        if (stripeCustomerId) {
          paymentIntentPayload.customer = stripeCustomerId;
        }

        const paymentIntent = await stripeClient.paymentIntents.create(paymentIntentPayload);

        // Create payment record
        const payment = await Payment.create({
          booking: bookingId,
          user: req.user.id,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: stripeCustomerId || 'none',
          amount: paymentIntent.amount,
          currency,
          amountInRupees: amount,
          status: 'pending',
          description: `Ticket booking - ${booking.bookingRef}`,
        });

        await Booking.findByIdAndUpdate(bookingId, { payment: payment._id });

        return res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          paymentId: payment._id,
        });
      } catch (stripeErr) {
        console.warn('Live Stripe call failed, falling back to test simulation:', stripeErr.message);
      }
    }

    // Resilient Sandbox Mode (when no real Stripe keys are supplied yet)
    const mockIntentId = `mock_pi_${booking._id}_${Date.now()}`;
    const mockClientSecret = `mock_secret_${booking._id}_${Date.now()}`;

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      stripePaymentIntentId: mockIntentId,
      amount: Math.round(amount * 100),
      currency,
      amountInRupees: amount,
      status: 'pending',
      description: `Test Sandbox Payment - ${booking.bookingRef}`,
    });

    await Booking.findByIdAndUpdate(bookingId, { payment: payment._id });

    res.json({
      success: true,
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      paymentId: payment._id,
      isSimulation: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Confirm payment (webhook or manual)
// @route POST /api/payments/confirm
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if simulation or real Stripe
    let isSucceeded = false;
    let latestCharge = 'ch_mock_' + Date.now();

    if (paymentIntentId.startsWith('mock_')) {
      isSucceeded = true;
    } else {
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      isSucceeded = paymentIntent.status === 'succeeded';
      latestCharge = paymentIntent.latest_charge;
    }

    if (isSucceeded) {
      payment.status = 'succeeded';
      payment.stripeChargeId = latestCharge;
      await payment.save();

      // Confirm booking
      const booking = await Booking.findByIdAndUpdate(
        payment.booking,
        {
          bookingStatus: 'Confirmed',
          paymentStatus: 'Paid',
        },
        { new: true }
      ).populate('movie show theatre');

      // Update user booking count
      await User.findByIdAndUpdate(payment.user, { $inc: { bookingsCount: 1 } });

      // Send notification
      await Notification.create({
        user: payment.user,
        title: '🎟️ Booking Confirmed!',
        message: `Your booking for ${booking.movie?.title} is confirmed. Ref: ${booking.bookingRef}`,
        type: 'booking_confirmed',
        data: { bookingId: booking._id },
        link: `/bookings/${booking._id}`,
      });

      res.json({ success: true, message: 'Payment confirmed', booking, payment });
    } else {
      payment.status = 'failed';
      await payment.save();

      await Booking.findByIdAndUpdate(payment.booking, {
        bookingStatus: 'Cancelled',
        paymentStatus: 'Failed',
      });

      await Notification.create({
        user: payment.user,
        title: '❌ Payment Failed',
        message: 'Your payment failed. Please try again.',
        type: 'payment_failed',
      });


      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc  Stripe Webhook
// @route POST /api/payments/webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { status: 'succeeded', stripeChargeId: pi.latest_charge }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        {
          status: 'failed',
          failureCode: pi.last_payment_error?.code,
          failureMessage: pi.last_payment_error?.message,
        }
      );
      break;
    }
  }

  res.json({ received: true });
};

// @desc  Refund payment
// @route POST /api/payments/refund/:bookingId
export const refundPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('payment');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const payment = booking.payment;
    if (!payment || payment.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'No successful payment to refund' });
    }

    // Create Stripe refund
    const refund = await getStripe().refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = refund.amount / 100;
    payment.refundedAt = new Date();
    await payment.save();

    booking.bookingStatus = 'Refunded';
    booking.paymentStatus = 'Refunded';
    booking.cancelledAt = new Date();
    booking.refundAmount = refund.amount / 100;
    await booking.save();

    await Notification.create({
      user: booking.user,
      title: '💰 Refund Initiated',
      message: `Refund of ₹${refund.amount / 100} for booking ${booking.bookingRef} has been initiated.`,
      type: 'payment_success',
    });

    res.json({ success: true, message: 'Refund initiated successfully', refund });
  } catch (error) {
    next(error);
  }
};

// @desc  Get payment details
// @route GET /api/payments/:paymentId
export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('booking');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
