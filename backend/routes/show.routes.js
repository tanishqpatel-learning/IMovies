import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getShows, getShowById, createShow, updateShow, deleteShow, reserveSeats,
} from '../controllers/show.controller.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:showId', getShowById);
router.post('/:showId/reserve', protect, reserveSeats);
router.post('/', protect, adminOnly, createShow);
router.put('/:id', protect, adminOnly, updateShow);
router.delete('/:id', protect, adminOnly, deleteShow);

export default router;
