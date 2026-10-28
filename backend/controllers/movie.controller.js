import axios from 'axios';
import Movie from '../models/Movie.js';

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.TMDB_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = process.env.OMDB_BASE_URL || 'http://www.omdbapi.com';
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/original';

// Helper: build full image URL
const imgUrl = (path) => (path ? `${TMDB_IMAGE_BASE}${path}` : null);

// Helper: fetch from TMDb
const tmdbGet = (endpoint, params = {}) =>
  axios.get(`${TMDB_BASE}${endpoint}`, {
    params: { api_key: TMDB_KEY, ...params },
  });

// Helper: fetch from OMDb
const omdbGet = (params) =>
  axios.get(`${OMDB_BASE}`, { params: { apikey: OMDB_KEY, ...params } });

// Transform TMDb movie data to our schema
const transformTMDb = (m) => ({
  tmdbId: String(m.id),
  title: m.title || m.name,
  originalTitle: m.original_title,
  overview: m.overview,
  posterPath: imgUrl(m.poster_path),
  backdropPath: imgUrl(m.backdrop_path),
  genres: m.genres || m.genre_ids?.map((id) => ({ id, name: '' })) || [],
  releaseDate: m.release_date ? new Date(m.release_date) : null,
  tmdbRating: m.vote_average,
  voteCount: m.vote_count,
  runtime: m.runtime,
  tagline: m.tagline,
  status: 'Now Showing',
});

// @desc  Get now playing / trending movies from TMDb
// @route GET /api/movies/trending
export const getTrendingMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    
    // Check if TMDb key is set
    const isTMDbConfigured = TMDB_KEY && !TMDB_KEY.startsWith('YOUR_TMDB');

    if (isTMDbConfigured) {
      try {
        const [nowPlaying, trending, upcoming] = await Promise.all([
          tmdbGet('/movie/now_playing', { page }),
          tmdbGet('/trending/movie/week', { page }),
          tmdbGet('/movie/upcoming', { page }),
        ]);

        return res.json({
          success: true,
          data: {
            nowPlaying: nowPlaying.data.results.map(transformTMDb),
            trending: trending.data.results.map(transformTMDb),
            upcoming: upcoming.data.results.map(transformTMDb),
          },
        });
      } catch (tmdbErr) {
        console.warn('TMDb trending fetch failed, falling back to local database:', tmdbErr.message);
      }
    }

    // Fallback to local DB movies
    const allLocal = await Movie.find({ isActive: true }).lean();
    const nowPlaying = allLocal.filter((m) => m.status === 'Now Showing');
    const upcoming = allLocal.filter((m) => m.status === 'Coming Soon');
    const trending = allLocal.slice(0, 10);

    res.json({
      success: true,
      data: {
        nowPlaying: nowPlaying.length > 0 ? nowPlaying : allLocal,
        trending: trending.length > 0 ? trending : allLocal,
        upcoming: upcoming.length > 0 ? upcoming : allLocal,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Search movies
// @route GET /api/movies/search?query=...
export const searchMovies = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    let tmdbMovies = [];
    const isTMDbConfigured = TMDB_KEY && !TMDB_KEY.startsWith('YOUR_TMDB');

    if (isTMDbConfigured) {
      try {
        const tmdbRes = await tmdbGet('/search/movie', { query, page });
        tmdbMovies = tmdbRes.data.results.map(transformTMDb);
      } catch (err) {
        console.warn('TMDb search failed:', err.message);
      }
    }

    // Also search local DB
    const localMovies = await Movie.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { overview: { $regex: query, $options: 'i' } },
        { 'genres.name': { $regex: query, $options: 'i' } },
      ],
    })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        tmdb: tmdbMovies,
        local: localMovies,
        totalPages: 1,
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get movie details from TMDb + OMDb
// @route GET /api/movies/tmdb/:tmdbId
export const getMovieDetails = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    // Check local cache first by tmdbId or MongoDB _id
    let movie = null;
    if (tmdbId.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(tmdbId).populate('shows');
    }
    if (!movie) {
      movie = await Movie.findOne({ tmdbId }).populate('shows');
    }

    if (!movie) {
      const isTMDbConfigured = TMDB_KEY && !TMDB_KEY.startsWith('YOUR_TMDB');
      if (isTMDbConfigured) {
        // Fetch from TMDb
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
          tmdbGet(`/movie/${tmdbId}`, { append_to_response: 'videos,credits,images' }),
          tmdbGet(`/movie/${tmdbId}/credits`),
          tmdbGet(`/movie/${tmdbId}/videos`),
        ]);

        const details = detailsRes.data;
        const cast = creditsRes.data.cast?.slice(0, 10).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profilePath: imgUrl(c.profile_path),
          order: c.order,
        }));
        const director = creditsRes.data.crew?.find((c) => c.job === 'Director')?.name;
        const trailer = videosRes.data.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );

        // Fetch OMDb for additional data
        let omdbData = {};
        try {
          if (details.imdb_id && OMDB_KEY && !OMDB_KEY.startsWith('YOUR_OMDB')) {
            const omdbRes = await omdbGet({ i: details.imdb_id });
            omdbData = {
              imdbRating: omdbRes.data.imdbRating,
              awards: omdbRes.data.Awards,
              boxOffice: omdbRes.data.BoxOffice,
              production: omdbRes.data.Production,
            };
          }
        } catch (e) {
          console.warn('OMDb fetch failed:', e.message);
        }

        // Save to local DB
        movie = await Movie.create({
          ...transformTMDb(details),
          imdbId: details.imdb_id,
          cast,
          director,
          trailerKey: trailer?.key,
          ...omdbData,
          ticketPrice: 200,
          isActive: true,
        });
      } else {
        // If external API not configured, pick the first movie or return 404
        movie = await Movie.findOne({ isActive: true }).populate('shows');
      }
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie details not found' });
    }

    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all local movies (with filters)
// @route GET /api/movies
export const getLocalMovies = async (req, res, next) => {
  try {
    const {
      status,
      genre,
      language,
      page = 1,
      limit = 12,
      sort = '-createdAt',
      featured,
    } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (genre) filter['genres.name'] = { $regex: genre, $options: 'i' };
    if (featured) filter.isFeatured = true;

    const skip = (page - 1) * limit;
    const [movies, total] = await Promise.all([
      Movie.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Movie.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: movies,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get movie by ID (local DB)
// @route GET /api/movies/:id
export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id).populate({
        path: 'shows',
        match: { date: { $gte: new Date() }, isActive: true },
        populate: { path: 'theatre', select: 'name address amenities' },
      });
    }
    if (!movie) {
      movie = await Movie.findOne({ tmdbId: id }).populate({
        path: 'shows',
        match: { date: { $gte: new Date() }, isActive: true },
        populate: { path: 'theatre', select: 'name address amenities' },
      });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc  Get genres from TMDb
// @route GET /api/movies/genres
export const getGenres = async (req, res, next) => {
  try {
    const isTMDbConfigured = TMDB_KEY && !TMDB_KEY.startsWith('YOUR_TMDB');
    if (isTMDbConfigured) {
      const res2 = await tmdbGet('/genre/movie/list');
      return res.json({ success: true, data: res2.data.genres });
    }
    throw new Error('Fallback to default genres');
  } catch (error) {
    res.json({
      success: true,
      data: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' },
        { id: 27, name: 'Horror' },
        { id: 878, name: 'Sci-Fi' },
        { id: 53, name: 'Thriller' },
      ],
    });
  }
};

// @desc  Admin: Create/update movie manually
// @route POST /api/movies
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Update movie
// @route PUT /api/movies/:id
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Delete movie
// @route DELETE /api/movies/:id
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, message: 'Movie deleted' });
  } catch (error) {
    next(error);
  }
};
