import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Notification from '../models/Notification.js';

// @desc  Create a booking
// @route POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, movieId, theatreId } = req.body;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Check seat availability
    const bookedOrReserved = [
      ...show.bookedSeats,
      ...show.reservedSeats
        .filter((r) => r.expiresAt > new Date() && r.userId.toString() !== req.user.id)
        .map((r) => r.seatNumber),
    ];

    const unavailable = seats.map((s) => s.seatNumber).filter((s) => bookedOrReserved.includes(s));
    if (unavailable.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${unavailable.join(', ')} are no longer available`,
        unavailableSeats: unavailable,
      });
    }

    // Normalize seats and calculate total amount
    const normalizedSeats = (seats || []).map((s) => ({
      ...s,
      seatType: s.seatType
        ? s.seatType.charAt(0).toUpperCase() + s.seatType.slice(1).toLowerCase()
        : 'Silver',
    }));

    const totalAmount = normalizedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const convenienceFee = Math.round(totalAmount * 0.02); // 2%
    const taxes = Math.round(totalAmount * 0.18); // 18% GST
    const finalAmount = totalAmount + convenienceFee + taxes;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      show: showId,
      movie: movieId,
      theatre: theatreId,
      seats: normalizedSeats,
      totalAmount,
      convenienceFee,
      taxes,
      finalAmount,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending',
      showDetails: {
        date: show.date,
        startTime: show.startTime,
        language: show.language,
        format: show.format,
        screenNumber: show.screenNumber,
      },
    });

    // Mark seats as booked in the show
    const seatNumbers = seats.map((s) => s.seatNumber);
    show.bookedSeats.push(...seatNumbers);
    show.availableSeats -= seatNumbers.length;
    // Remove from reservedSeats
    show.reservedSeats = show.reservedSeats.filter(
      (r) => !seatNumbers.includes(r.seatNumber)
    );
    await show.save();

    // Broadcast real-time seat update
    const io = req.app.get('io');
    io.to(`show-${showId}`).emit('seats-booked', { seats: seatNumbers });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's bookings
// @route GET /api/bookings/my
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.bookingStatus = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('movie', 'title posterPath genres runtime')
        .populate({ path: 'show', populate: { path: 'theatre', select: 'name address' } })
        .populate('payment', 'status amountInRupees')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get booking by ID
// @route GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate({ path: 'show', populate: { path: 'theatre' } })
      .populate('user', 'name email phone')
      .populate('payment');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Cancel booking
// @route PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Release seats back to show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: seatNumbers } },
      $inc: { availableSeats: seatNumbers.length },
    });

    booking.bookingStatus = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    // Notify
    await Notification.create({
      user: req.user.id,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingRef} has been cancelled. Refund will be processed if applicable.`,
      type: 'booking_cancelled',
    });

    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Get all bookings
// @route GET /api/bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.bookingStatus = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate('theatre', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
