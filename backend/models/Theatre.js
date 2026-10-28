import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      country: { type: String, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    phone: { type: String },
    email: { type: String },
    amenities: [String], // ['Parking', 'Food Court', 'IMAX', '4DX', etc.]
    screens: [
      {
        screenNumber: { type: Number, required: true },
        screenName: { type: String },
        screenType: {
          type: String,
          enum: ['Standard', 'IMAX', '4DX', 'Gold', 'Platinum'],
          default: 'Standard',
        },
        totalSeats: { type: Number, required: true },
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
        seatingLayout: {
          sections: [
            {
              name: String, // 'Silver', 'Gold', 'Platinum'
              rows: [String], // ['A', 'B', 'C']
              priceMultiplier: { type: Number, default: 1 },
            },
          ],
        },
      },
    ],
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0 },
    totalShows: { type: Number, default: 0 },
    image: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

theatreSchema.index({ location: '2dsphere' });
theatreSchema.index({ 'address.city': 1 });

export default mongoose.model('Theatre', theatreSchema);
