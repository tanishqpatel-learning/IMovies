import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getTrendingMovies, searchMovies, getMovieDetails, getLocalMovies,
  getMovieById, getGenres, createMovie, updateMovie, deleteMovie,
} from '../controllers/movie.controller.js';

const router = express.Router();

router.get('/trending', getTrendingMovies);
router.get('/search', searchMovies);
router.get('/genres', getGenres);
router.get('/tmdb/:tmdbId', getMovieDetails);
router.get('/', getLocalMovies);
router.get('/:id', getMovieById);
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

export default router;
