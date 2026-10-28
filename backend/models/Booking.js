import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },

    seats: [
      {
        seatNumber: { type: String, required: true },
        seatType: {
          type: String,
          enum: ['Silver', 'Gold', 'Platinum', 'silver', 'gold', 'platinum'],
          default: 'Silver',
          set: (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : 'Silver'),
        },
        price: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },
    convenienceFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

    // Booking reference number
    bookingRef: { type: String, unique: true },

    // Cancellation
    cancelledAt: Date,
    cancellationReason: String,
    refundAmount: { type: Number, default: 0 },

    // QR Code / Ticket
    qrCode: String,
    isCheckedIn: { type: Boolean, default: false },
    checkedInAt: Date,

    // Show details at time of booking (snapshot)
    showDetails: {
      date: Date,
      startTime: String,
      language: String,
      format: String,
      screenNumber: Number,
    },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function () {
  if (!this.bookingRef) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingRef = `IMV-${timestamp}-${random}`;
  }
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1 });

export default mongoose.model('Booking', bookingSchema);
