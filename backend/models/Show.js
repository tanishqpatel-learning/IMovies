import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    screenNumber: { type: Number, required: true },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX', '4DX', 'Gold', 'Platinum'],
      default: 'Standard',
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "10:30"
    endTime: { type: String },
    language: { type: String, default: 'English' },
    format: { type: String, enum: ['2D', '3D', 'IMAX 3D', '4DX'], default: '2D' },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number },
    bookedSeats: [String], // seat numbers like ['A1', 'A2', 'B5']
    reservedSeats: [
      {
        seatNumber: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reservedAt: { type: Date, default: Date.now },
        expiresAt: Date, // Reservation expires in 10 mins
      },
    ],
    pricing: {
      silver: { type: Number, required: true },
      gold: { type: Number, default: 0 },
      platinum: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Running', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

showSchema.pre('save', function () {
  if (!this.availableSeats) {
    this.availableSeats = this.totalSeats;
  }
});

// Index for fast show lookups
showSchema.index({ movie: 1, date: 1 });
showSchema.index({ theatre: 1, date: 1 });
showSchema.index({ date: 1, isActive: 1 });

export default mongoose.model('Show', showSchema);
