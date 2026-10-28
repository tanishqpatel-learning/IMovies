import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Payment from '../models/Payment.js';
// Node 24+ has native fetch built-in — no extra import needed

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [users, movies, bookings, theatres, payments] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Theatre.countDocuments({ isActive: true }),
      Payment.find({ status: 'succeeded' }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amountInRupees || 0), 0);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amountInRupees' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top movies by booking count
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'Confirmed' } },
      { $group: { _id: '$movie', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      { $project: { 'movie.title': 1, 'movie.posterPath': 1, count: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { users, movies, bookings, theatres, totalRevenue },
        recentBookings,
        monthlyRevenue,
        topMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Get all users
// @route GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, data: users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Toggle user status
// @route PUT /api/admin/users/:id/toggle
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Update user role
// @route PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// OMDb Integration
// ─────────────────────────────────────────────────

const OMDB_KEY = process.env.OMDB_API_KEY || '33f4ff41';
const OMDB_BASE = 'https://www.omdbapi.com';

// Helper: fetch one full OMDb movie by imdbID
async function fetchOmdbById(imdbId) {
  const url = `${OMDB_BASE}/?i=${imdbId}&plot=full&apikey=${OMDB_KEY}`;
  const res = await fetch(url);
  return res.json();
}

// @desc  Admin: Search OMDb by title (returns list of results)
// @route GET /api/admin/omdb/search?q=avengers
export const searchOmdb = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query too short' });
    }

    const url = `${OMDB_BASE}/?s=${encodeURIComponent(q)}&type=movie&apikey=${OMDB_KEY}`;
    const omdbRes = await fetch(url);
    const data = await omdbRes.json();

    if (data.Response === 'False') {
      return res.json({ success: true, results: [] });
    }

    // For each search hit, fetch full details to get runtime / ratings
    const detailed = await Promise.all(
      (data.Search || []).slice(0, 8).map((m) => fetchOmdbById(m.imdbID))
    );

    res.json({ success: true, results: detailed });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Import an OMDb movie into local DB
// @route POST /api/admin/omdb/import
// body: { imdbId, status, ticketPrice }
export const importOmdbMovie = async (req, res, next) => {
  try {
    const { imdbId, status = 'Now Showing', ticketPrice = 200 } = req.body;

    if (!imdbId) {
      return res.status(400).json({ success: false, message: 'imdbId is required' });
    }

    // Check duplicate
    const existing = await Movie.findOne({ imdbId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Movie already exists in database' });
    }

    const omdb = await fetchOmdbById(imdbId);
    if (omdb.Response === 'False') {
      return res.status(404).json({ success: false, message: 'Movie not found on OMDb' });
    }

    // Map OMDb genre string → array
    const genres = (omdb.Genre || '')
      .split(',')
      .map((g, i) => ({ id: i + 1, name: g.trim() }))
      .filter((g) => g.name);

    // Parse runtime "142 min" → 142
    const runtime = parseInt(omdb.Runtime) || 120;

    // Build poster: use OMDb poster directly
    const posterPath = omdb.Poster && omdb.Poster !== 'N/A' ? omdb.Poster : '';

    // Parse release date
    const releaseDate = omdb.Released && omdb.Released !== 'N/A'
      ? new Date(omdb.Released)
      : null;

    // Build cast array from Actors string
    const cast = (omdb.Actors || '')
      .split(',')
      .map((name, i) => ({ id: i + 1, name: name.trim(), character: '', order: i }))
      .filter((a) => a.name);

    const movie = await Movie.create({
      imdbId,
      title: omdb.Title,
      originalTitle: omdb.Title,
      overview: omdb.Plot && omdb.Plot !== 'N/A' ? omdb.Plot : '',
      posterPath,
      genres,
      runtime,
      releaseDate,
      status,
      ticketPrice,
      imdbRating: omdb.imdbRating && omdb.imdbRating !== 'N/A' ? omdb.imdbRating : '',
      voteCount: parseInt((omdb.imdbVotes || '').replace(/,/g, '')) || 0,
      director: omdb.Director && omdb.Director !== 'N/A' ? omdb.Director : '',
      cast,
      certification: omdb.Rated && omdb.Rated !== 'N/A' ? omdb.Rated : 'U/A',
      awards: omdb.Awards && omdb.Awards !== 'N/A' ? omdb.Awards : '',
      boxOffice: omdb.BoxOffice && omdb.BoxOffice !== 'N/A' ? omdb.BoxOffice : '',
      production: omdb.Production && omdb.Production !== 'N/A' ? omdb.Production : '',
      isActive: true,
    });

    res.status(201).json({ success: true, movie, message: `"${movie.title}" imported successfully!` });
  } catch (error) {
    next(error);
  }
};
