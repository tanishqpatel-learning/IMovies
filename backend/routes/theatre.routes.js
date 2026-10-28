import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre,
} from '../controllers/theatre.controller.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

export default router;
