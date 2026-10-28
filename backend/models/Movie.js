import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    // IDs for external APIs
    tmdbId: { type: String, unique: true, sparse: true },
    imdbId: { type: String, sparse: true },

    title: { type: String, required: true, trim: true },
    originalTitle: { type: String },
    overview: { type: String },
    tagline: { type: String },

    // Media
    posterPath: { type: String },
    backdropPath: { type: String },
    trailerKey: { type: String },

    // Details
    genres: [{ id: Number, name: String }],
    languages: [{ iso_639_1: String, name: String, english_name: String }],
    runtime: { type: Number }, // in minutes
    releaseDate: { type: Date },
    status: {
      type: String,
      enum: ['Now Showing', 'Coming Soon', 'Ended'],
      default: 'Coming Soon',
    },

    // Ratings
    tmdbRating: { type: Number, default: 0 },
    imdbRating: { type: String },
    voteCount: { type: Number, default: 0 },

    // Cast & Crew
    cast: [
      {
        id: Number,
        name: String,
        character: String,
        profilePath: String,
        order: Number,
      },
    ],
    director: { type: String },
    producers: [String],

    // Certification / Classification
    certification: { type: String, default: 'U/A' },
    contentRating: { type: String },

    // Booking-related
    ticketPrice: { type: Number, default: 150 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    bookingCount: { type: Number, default: 0 },

    // Additional info from OMDb
    awards: String,
    boxOffice: String,
    production: String,
    website: String,

    // Admin-added shows
    shows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Show' }],
  },
  { timestamps: true }
);

// Indexes for search
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ 'genres.name': 1 });

export default mongoose.model('Movie', movieSchema);
