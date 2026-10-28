import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Show from '../models/Show.js';

const router = express.Router();

// Get seat layout for a show
router.get('/show/:showId', protect, async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId)
      .populate('theatre', 'screens');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Get the screen layout
    const screen = show.theatre?.screens?.find(
      (s) => s.screenNumber === show.screenNumber
    );

    // Build seat map
    const rows = screen?.rows || 10;
    const cols = screen?.columns || 15;

    let sections = (screen?.seatingLayout?.sections && screen.seatingLayout.sections.length > 0)
      ? screen.seatingLayout.sections
      : null;

    if (!sections || sections.length === 0) {
      const silverCount = Math.max(1, Math.floor(rows * 0.5));
      const goldCount = Math.max(1, Math.floor(rows * 0.3));
      const platinumCount = Math.max(1, rows - silverCount - goldCount);

      sections = [
        {
          name: 'Silver',
          rows: Array.from({ length: silverCount }, (_, i) => String.fromCharCode(65 + i)),
          priceMultiplier: 1,
        },
        {
          name: 'Gold',
          rows: Array.from({ length: goldCount }, (_, i) => String.fromCharCode(65 + silverCount + i)),
          priceMultiplier: 1.4,
        },
        {
          name: 'Platinum',
          rows: Array.from({ length: platinumCount }, (_, i) => String.fromCharCode(65 + silverCount + goldCount + i)),
          priceMultiplier: 1.8,
        },
      ].filter((s) => s.rows && s.rows.length > 0);
    }

    const baseSilver = show.pricing?.silver || 150;
    const baseGold = show.pricing?.gold || Math.round(baseSilver * 1.4);
    const basePlatinum = show.pricing?.platinum || Math.round(baseSilver * 1.8);

    res.json({
      success: true,
      data: {
        showId: show._id,
        bookedSeats: show.bookedSeats || [],
        reservedSeats: (show.reservedSeats || [])
          .filter((r) => r.expiresAt > new Date())
          .map((r) => ({ seatNumber: r.seatNumber, userId: r.userId })),
        sections,
        totalSeats: show.totalSeats,
        availableSeats: show.availableSeats,
        pricing: {
          silver: baseSilver,
          gold: baseGold,
          platinum: basePlatinum,
        },
        rows,
        cols,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
