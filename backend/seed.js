import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';

dotenv.config();

const sampleMovies = [
  {
    tmdbId: '693134',
    imdbId: 'tt15239678',
    title: 'Dune: Part Two',
    overview:
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    tagline: 'Long live the fighters.',
    posterPath: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    trailerKey: 'Way9Dexny3w',
    genres: [
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' },
    ],
    runtime: 166,
    releaseDate: new Date('2024-03-01'),
    status: 'Now Showing',
    tmdbRating: 8.4,
    imdbRating: '8.6',
    voteCount: 4890,
    certification: 'U/A',
    ticketPrice: 250,
    director: 'Denis Villeneuve',
    isFeatured: true,
    cast: [
      { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profilePath: 'https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7upkaOP.jpg', order: 0 },
      { id: 2, name: 'Zendaya', character: 'Chani', profilePath: 'https://image.tmdb.org/t/p/w185/r3A7drrtun9KVIEVECABQI0FA5q.jpg', order: 1 },
      { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profilePath: 'https://image.tmdb.org/t/p/w185/6NRn5GIR4nS5P5iE8k2BovcIom7.jpg', order: 2 },
      { id: 4, name: 'Javier Bardem', character: 'Stilgar', profilePath: 'https://image.tmdb.org/t/p/w185/grfecvU1D1qN4q0J4Y2P4sJ50cO.jpg', order: 3 },
    ],
  },
  {
    tmdbId: '872585',
    imdbId: 'tt15398776',
    title: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, exploring the deep moral dilemmas and historical ramifications of scientific achievement.',
    tagline: 'The world forever changes.',
    posterPath: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    trailerKey: 'uYPbbksJxIg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' },
    ],
    runtime: 180,
    releaseDate: new Date('2023-07-21'),
    status: 'Now Showing',
    tmdbRating: 8.1,
    imdbRating: '8.9',
    voteCount: 8200,
    certification: 'A',
    ticketPrice: 220,
    director: 'Christopher Nolan',
    isFeatured: true,
    cast: [
      { id: 5, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w185/iGie0m9aZ9f6vY5eN6FkUfB50A7.jpg', order: 0 },
      { id: 6, name: 'Emily Blunt', character: 'Katherine Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w185/nPJXaRMvuFLvgm17BM29W4RiRaV.jpg', order: 1 },
      { id: 7, name: 'Matt Damon', character: 'Leslie Groves', profilePath: 'https://image.tmdb.org/t/p/w185/elSlNgV8xVifsbHpFsqrga20Jy.jpg', order: 2 },
      { id: 8, name: 'Robert Downey Jr.', character: 'Lewis Strauss', profilePath: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lNWGB99oc.jpg', order: 3 },
    ],
  },
  {
    tmdbId: '569094',
    imdbId: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    overview:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    tagline: 'It’s how you wear the mask that matters.',
    posterPath: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    trailerKey: 'cqGjhVJWtEg',
    genres: [
      { id: 16, name: 'Animation' },
      { id: 28, name: 'Action' },
      { id: 878, name: 'Sci-Fi' },
    ],
    runtime: 140,
    releaseDate: new Date('2023-06-02'),
    status: 'Now Showing',
    tmdbRating: 8.4,
    imdbRating: '8.7',
    voteCount: 6300,
    certification: 'U',
    ticketPrice: 200,
    director: 'Joaquim Dos Santos',
    isFeatured: false,
    cast: [
      { id: 9, name: 'Shameik Moore', character: 'Miles Morales (voice)', order: 0 },
      { id: 10, name: 'Hailee Steinfeld', character: 'Gwen Stacy (voice)', order: 1 },
      { id: 11, name: 'Oscar Isaac', character: 'Miguel O\'Hara (voice)', order: 2 },
    ],
  },
  {
    tmdbId: '763215',
    imdbId: 'tt10640346',
    title: 'Avatar: The Way of Water',
    overview:
      'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
    tagline: 'Return to Pandora.',
    posterPath: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZIMQvRjr22q.jpg',
    trailerKey: 'd9MyW72ELq0',
    genres: [
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' },
      { id: 28, name: 'Action' },
    ],
    runtime: 192,
    releaseDate: new Date('2022-12-16'),
    status: 'Now Showing',
    tmdbRating: 7.7,
    imdbRating: '7.6',
    voteCount: 10500,
    certification: 'U/A',
    ticketPrice: 280,
    director: 'James Cameron',
    isFeatured: false,
    cast: [
      { id: 12, name: 'Sam Worthington', character: 'Jake Sully', order: 0 },
      { id: 13, name: 'Zoe Saldaña', character: 'Neytiri', order: 1 },
      { id: 14, name: 'Sigourney Weaver', character: 'Kiri', order: 2 },
    ],
  },
  {
    tmdbId: '414906',
    imdbId: 'tt1877830',
    title: 'The Batman',
    overview:
      'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
    tagline: 'Unmask the truth.',
    posterPath: 'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    trailerKey: 'mqqft2x_Aa4',
    genres: [
      { id: 80, name: 'Crime' },
      { id: 9648, name: 'Mystery' },
      { id: 53, name: 'Thriller' },
    ],
    runtime: 176,
    releaseDate: new Date('2022-03-04'),
    status: 'Now Showing',
    tmdbRating: 7.7,
    imdbRating: '7.8',
    voteCount: 9200,
    certification: 'A',
    ticketPrice: 190,
    director: 'Matt Reeves',
    isFeatured: false,
    cast: [
      { id: 15, name: 'Robert Pattinson', character: 'Bruce Wayne / Batman', order: 0 },
      { id: 16, name: 'Zoë Kravitz', character: 'Selina Kyle / Catwoman', order: 1 },
      { id: 17, name: 'Paul Dano', character: 'Edward Nashton / Riddler', order: 2 },
    ],
  },
  {
    tmdbId: '157336',
    imdbId: 'tt0816692',
    title: 'Interstellar',
    overview:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    posterPath: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    trailerKey: 'zSWdZVtXT7E',
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Sci-Fi' },
    ],
    runtime: 169,
    releaseDate: new Date('2014-11-07'),
    status: 'Coming Soon',
    tmdbRating: 8.4,
    imdbRating: '8.7',
    voteCount: 34000,
    certification: 'U/A',
    ticketPrice: 220,
    director: 'Christopher Nolan',
    isFeatured: false,
    cast: [
      { id: 18, name: 'Matthew McConaughey', character: 'Joseph Cooper', order: 0 },
      { id: 19, name: 'Anne Hathaway', character: 'Amelia Brand', order: 1 },
      { id: 20, name: 'Jessica Chastain', character: 'Murphy Cooper', order: 2 },
    ],
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear old data
    console.log('🧹 Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('👤 Creating default users...');
    // Pass plain-text passwords — the User model pre-save hook will hash them correctly
    const admin = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      phone: '+91 99999 88888',
      role: 'admin',
      isActive: true,
    });

    const customer = await User.create({
      name: 'Alex Johnson',
      email: 'demo@imovies.com',
      password: 'user123',
      phone: '+91 98765 43210',
      role: 'user',
      isActive: true,
    });
    console.log('   ✓ Admin user: admin@imovies.com / admin123');
    console.log('   ✓ Demo user:  demo@imovies.com / user123');

    // 2. Create Theatres
    console.log('🏛️ Creating cinema theatres...');
    const theatre1 = await Theatre.create({
      name: 'PVR INOX IMAX Megaplex',
      address: {
        street: 'High Street Phoenix, Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400013',
        country: 'India',
      },
      phone: '+91 22 4000 8888',
      email: 'phoenix@pvrcinemas.com',
      amenities: ['IMAX Laser', 'Dolby Atmos 7.1', 'Gourmet Lounge', 'Valet Parking', 'Wheelchair Access'],
      rating: 4.8,
      screens: [
        {
          screenNumber: 1,
          screenName: 'Audi 1 - IMAX Laser',
          screenType: 'IMAX',
          totalSeats: 120,
          rows: 8,
          columns: 15,
          seatingLayout: {
            sections: [
              { name: 'Silver', rows: ['A', 'B', 'C'], priceMultiplier: 1 },
              { name: 'Gold', rows: ['D', 'E', 'F'], priceMultiplier: 1.4 },
              { name: 'Platinum', rows: ['G', 'H'], priceMultiplier: 1.8 },
            ],
          },
        },
        {
          screenNumber: 2,
          screenName: 'Audi 2 - Dolby Cinema',
          screenType: 'Standard',
          totalSeats: 100,
          rows: 10,
          columns: 10,
        },
      ],
      isActive: true,
      admin: admin._id,
    });

    const theatre2 = await Theatre.create({
      name: 'Cinépolis VIP & 4DX Cinema',
      address: {
        street: 'Orion Mall, Brigade Gateway, Rajajinagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560055',
        country: 'India',
      },
      phone: '+91 80 2200 4400',
      email: 'orion@cinepolis.com',
      amenities: ['4DX Motion Seats', 'VIP Recliners', 'Food Court', 'Parking'],
      rating: 4.7,
      screens: [
        {
          screenNumber: 1,
          screenName: 'Audi 1 - 4DX Dynamic',
          screenType: '4DX',
          totalSeats: 90,
          rows: 6,
          columns: 15,
        },
      ],
      isActive: true,
      admin: admin._id,
    });

    // 3. Create Movies
    console.log('🎬 Inserting curated movie titles...');
    const createdMovies = await Movie.insertMany(sampleMovies);

    // 4. Create Shows for next 5 days
    console.log('⏰ Scheduling shows and screens...');
    const showTimes = ['10:30', '14:15', '18:00', '21:30'];
    const showDocs = [];

    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + dayOffset);
      showDate.setHours(0, 0, 0, 0);

      // Distribute shows across movies and theatres
      createdMovies.slice(0, 4).forEach((movie, mIdx) => {
        const theatre = mIdx % 2 === 0 ? theatre1 : theatre2;
        const time1 = showTimes[mIdx % showTimes.length];
        const time2 = showTimes[(mIdx + 2) % showTimes.length];

        [time1, time2].forEach((time, tIdx) => {
          showDocs.push({
            movie: movie._id,
            theatre: theatre._id,
            screenNumber: (tIdx % 2) + 1,
            screenType: theatre.screens[0].screenType || 'IMAX',
            date: showDate,
            startTime: time,
            language: 'English',
            format: mIdx === 0 ? 'IMAX 3D' : mIdx === 3 ? '3D' : '2D',
            totalSeats: 120,
            availableSeats: 116,
            bookedSeats: ['A3', 'A4', 'E8', 'E9'], // Some pre-booked seats
            reservedSeats: [],
            pricing: {
              silver: movie.ticketPrice || 180,
              gold: Math.round((movie.ticketPrice || 180) * 1.4),
              platinum: Math.round((movie.ticketPrice || 180) * 1.8),
            },
            isActive: true,
            status: 'Scheduled',
          });
        });
      });
    }

    const createdShows = await Show.insertMany(showDocs);

    // Link shows to movies
    for (const movie of createdMovies) {
      const movieShows = createdShows.filter((s) => s.movie.toString() === movie._id.toString());
      movie.shows = movieShows.map((s) => s._id);
      await movie.save();
    }

    // 5. Create a sample initial confirmed booking for the demo user
    console.log('🎟️ Creating initial sample booking for demo user...');
    const sampleShow = createdShows[0];
    const duneMovie = createdMovies[0];

    const sampleBooking = await Booking.create({
      user: customer._id,
      show: sampleShow._id,
      movie: duneMovie._id,
      theatre: theatre1._id,
      seats: [
        { seatNumber: 'E8', seatType: 'Gold', price: 350 },
        { seatNumber: 'E9', seatType: 'Gold', price: 350 },
      ],
      totalAmount: 700,
      convenienceFee: 14,
      taxes: 126,
      finalAmount: 840,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      bookingRef: 'IMV-DEMO-2024',
      showDetails: {
        date: sampleShow.date,
        startTime: sampleShow.startTime,
        language: sampleShow.language,
        format: sampleShow.format,
        screenNumber: sampleShow.screenNumber,
      },
    });

    // Create matching payment
    await Payment.create({
      booking: sampleBooking._id,
      user: customer._id,
      stripePaymentIntentId: 'mock_pi_sample_demo_stripe',
      stripeChargeId: 'ch_mock_demo_123',
      amount: 84000,
      currency: 'inr',
      amountInRupees: 840,
      status: 'succeeded',
      description: 'IMovies Ticket Booking - Dune: Part Two',
    });

    console.log('\n========================================');
    console.log('🎉 IMovies Cinema Platform Seeded Successfully!');
    console.log('========================================');
    console.log('📌 Test Accounts:');
    console.log('   Admin:    admin@imovies.com  | admin123');
    console.log('   Customer: demo@imovies.com   | user123');
    console.log('📌 Data summary:');
    console.log(`   - ${createdMovies.length} Blockbuster Movies`);
    console.log(`   - 2 Luxury Theatres (Mumbai & Bengaluru)`);
    console.log(`   - ${createdShows.length} Scheduled Cinema Shows`);
    console.log(`   - 1 Confirmed Sample Ticket with QR Code`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
