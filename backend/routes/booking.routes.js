import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings,
} from '../controllers/booking.controller.js';

const router = express.Router();

router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/', protect, adminOnly, getAllBookings); // Admin only

export default router;
