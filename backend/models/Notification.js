import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking_confirmed', 'booking_cancelled', 'payment_success', 'payment_failed', 'show_reminder', 'promo', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed }, // additional data like bookingId
    link: { type: String }, // optional navigation link
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
