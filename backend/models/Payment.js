import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Stripe fields
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    stripePaymentMethodId: { type: String },
    stripeCustomerId: { type: String },
    stripeChargeId: { type: String },

    amount: { type: Number, required: true }, // in smallest currency unit (paise for INR)
    currency: { type: String, default: 'inr' },
    amountInRupees: { type: Number },

    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      default: 'card',
    },

    // Refund details
    refundId: String,
    refundAmount: { type: Number, default: 0 },
    refundedAt: Date,

    // Metadata
    description: String,
    receiptUrl: String,
    metadata: { type: mongoose.Schema.Types.Mixed },

    // Error tracking
    failureCode: String,
    failureMessage: String,
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
