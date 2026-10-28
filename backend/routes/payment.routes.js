import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  createPaymentIntent, confirmPayment, stripeWebhook, refundPayment, getPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Stripe webhook (raw body needed - handled via express.raw in server)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/refund/:bookingId', protect, refundPayment);
router.get('/:paymentId', protect, getPayment);

export default router;
