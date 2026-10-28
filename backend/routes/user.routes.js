import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get user profile with notifications
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ success: true, user, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Get notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Mark notification as read
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Mark all as read
router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
