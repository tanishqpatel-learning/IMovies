import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  register, login, logout, getMe, updateProfile, changePassword,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
