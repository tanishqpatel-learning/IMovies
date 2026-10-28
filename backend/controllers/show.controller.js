import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// @desc  Get shows for a movie on a date
// @route GET /api/shows?movieId=&date=&city=
export const getShows = async (req, res, next) => {
  try {
    const { movieId, date, city, theatreId } = req.query;
    const filter = { isActive: true };

    if (movieId) {
      if (movieId.match(/^[0-9a-fA-F]{24}$/)) {
        filter.movie = movieId;
      } else {
        const movieDoc = await Movie.findOne({ tmdbId: movieId });
        if (movieDoc) filter.movie = movieDoc._id;
        else filter.movie = movieId;
      }
    }
    if (theatreId) filter.theatre = theatreId;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default: today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }

    const shows = await Show.find(filter)
      .populate('movie', 'title posterPath runtime genres certification')
      .populate({ path: 'theatre', select: 'name address amenities screens' })
      .sort({ date: 1, startTime: 1 });

    // Group by theatre
    const grouped = {};
    shows.forEach((show) => {
      const theatreId = show.theatre?._id?.toString();
      if (!grouped[theatreId]) {
        grouped[theatreId] = {
          theatre: show.theatre,
          shows: [],
        };
      }
      grouped[theatreId].shows.push(show);
    });

    res.json({ success: true, data: Object.values(grouped), total: shows.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single show with real-time seat availability
// @route GET /api/shows/:showId
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.showId)
      .populate('movie', 'title posterPath runtime certification tagline')
      .populate('theatre', 'name address amenities screens');

    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Clean expired reservations (older than 10 minutes)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    show.reservedSeats = show.reservedSeats.filter((r) => r.expiresAt > new Date());
    await show.save();

    res.json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Create a show
// @route POST /api/shows
export const createShow = async (req, res, next) => {
  try {
    const show = await Show.create(req.body);

    // Link show to movie
    await Movie.findByIdAndUpdate(req.body.movie, {
      $push: { shows: show._id },
      status: 'Now Showing',
    });

    const populated = await Show.findById(show._id)
      .populate('movie', 'title')
      .populate('theatre', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Update show
// @route PUT /api/shows/:id
export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Delete show
// @route DELETE /api/shows/:id
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, message: 'Show deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Reserve seats temporarily (10 min hold)
// @route POST /api/shows/:showId/reserve
export const reserveSeats = async (req, res, next) => {
  try {
    const { seats } = req.body; // ['A1', 'A2']
    const show = await Show.findById(req.params.showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Check if seats are available
    const bookedOrReserved = [
      ...show.bookedSeats,
      ...show.reservedSeats.map((r) => r.seatNumber),
    ];

    const unavailable = seats.filter((s) => bookedOrReserved.includes(s));
    if (unavailable.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${unavailable.join(', ')} are not available`,
        unavailableSeats: unavailable,
      });
    }

    // Add reservations with 10-min expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newReservations = seats.map((seatNumber) => ({
      seatNumber,
      userId: req.user.id,
      reservedAt: new Date(),
      expiresAt,
    }));

    show.reservedSeats.push(...newReservations);
    await show.save();

    // Broadcast via socket
    const io = req.app.get('io');
    io.to(`show-${show._id}`).emit('seats-reserved', { seats, userId: req.user.id });

    res.json({ success: true, message: 'Seats reserved for 10 minutes', expiresAt });
  } catch (error) {
    next(error);
  }
};
