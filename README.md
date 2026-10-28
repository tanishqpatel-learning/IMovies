# 🎬 IMovies — Modern Real-Time Cinema Ticket Booking Platform

A full-stack, enterprise-grade cinema management and real-time movie ticket booking platform built with **React 19**, **Express.js**, **MongoDB**, **Socket.io**, and **Stripe Payment Gateway**. Powered by real-time movie data integration from **TMDb** and **OMDb**.

---

## 🌟 Key Features

### 🍿 Customer Experience
- **Dynamic Hero & Browse**: Explore Trending, Now Showing, and Upcoming movies with high-res backdrops and YouTube trailers.
- **Movies Catalog**: Multi-attribute filtering (genre, status, rating, release date) and instant search.
- **Movie Details & Showtimes**: Movie synopsis, cast carousels, certification tags, date picker, theatre auditoriums (IMAX, 4DX, Standard, Gold Class).
- **Interactive Real-Time Seating**: Live Socket.io seat selection with multi-tier seating (Silver, Gold, Platinum VIP) and collision prevention.
- **Stripe Checkout**: 3-step modern Stripe payment flow with automated tax/GST breakdown and immediate test sandbox simulation.
- **Digital Boarding Pass & QR Code**: Print-ready cinema pass with generated QR code for barcode scanner turnstiles and ticket cancellation.

### 🛡️ Administrator Control Panel (`/admin`)
- **Executive Analytics**: Box-office revenue tracker, bookings volume, and registered user KPIs.
- **Movie Catalog Manager**: Add cinema titles manually or import from TMDb.
- **Show Scheduling**: Schedule shows by picking Movie, Theatre, Screen Type (IMAX/4DX/Standard), Date/Time, and Tier Pricing.
- **Live Bookings Feed**: Real-time customer transaction tracking with search and cancellation controls.
- **User Management**: View user accounts and toggle active/suspended status.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Redux Toolkit, React Router v7, Vanilla CSS Modules, Lucide React, Socket.io Client, Stripe Elements |
| **Backend** | Node.js, Express.js (ESM), MongoDB (Mongoose), Socket.io, Stripe SDK, Helmet, Rate Limiter |
| **APIs** | TMDb API (The Movie Database), OMDb API (Open Movie Database), Stripe Payment Gateway |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://localhost:27017/imovies`) or a free [MongoDB Atlas Cluster URI](https://www.mongodb.com/atlas)

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure your environment in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/imovies   # Or your MongoDB Atlas connection string
JWT_SECRET=imovies_super_secret_jwt_key_2024
FRONTEND_URL=http://localhost:5173

# Optional: Add your TMDb and OMDb keys for live syncing
TMDB_API_KEY=YOUR_TMDB_API_KEY_HERE
OMDB_API_KEY=YOUR_OMDB_API_KEY_HERE

# Optional: Add your Stripe keys (Sandbox simulation runs automatically if unset)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

#### Seed Initial Database
Once MongoDB is running, populate movies, theatres, screens, and shows:
```bash
npm run seed
```

> **Default Seed Accounts:**
> - **Administrator**: `admin@imovies.com` / `admin123`
> - **Customer**: `demo@imovies.com` / `user123`

#### Start Backend Server:
```bash
npm run dev
# or: npm start
```
API runs on `http://localhost:5000`

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Client runs on `http://localhost:5173`

---

## 🔒 Stripe Integration

This platform replaces Razorpay with **Stripe**:
- **Live Stripe Keys**: If you set valid `STRIPE_SECRET_KEY` (`sk_test_...`) and `STRIPE_PUBLISHABLE_KEY` (`pk_test_...`), real Stripe Elements are embedded into the checkout flow.
- **Automatic Sandbox Simulation**: If live Stripe keys are not yet provided, the checkout automatically presents a sleek Sandbox Simulation mode with 1-click payment confirmation so the entire ticket reservation flow can be verified end-to-end with zero friction.

---

## 📂 Project Directory Structure

```
movies ticket booking/
├── backend/
│   ├── controllers/      # Admin, Auth, Booking, Movie, Payment, Show, Theatre
│   ├── models/           # User, Movie, Theatre, Show, Booking, Payment, Notification
│   ├── routes/           # RESTful API route definitions
│   ├── middleware/       # JWT auth, role validation, error handling
│   ├── seed.js           # Database seeder with sample data
│   ├── server.js         # HTTP + Socket.io entry point
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar/            # Glassmorphism header with search and city picker
    │   │   ├── Footer/            # Cinema footer with Stripe badges and links
    │   │   └── ProtectedRoute/    # Auth and admin route guard
    │   ├── pages/
    │   │   ├── Home/              # Hero banner slider, now showing, trending
    │   │   ├── Movies/            # Multi-category movies explorer
    │   │   ├── MovieDetail/       # Backdrop hero, cast list, trailer modal, date picker
    │   │   ├── SeatSelection/     # Real-time Socket.io seat layout (Silver/Gold/Platinum)
    │   │   ├── Checkout/          # Stripe checkout & sandbox simulator
    │   │   ├── Bookings/          # My Bookings history and cancellation
    │   │   ├── BookingDetails/    # Digital boarding pass & QR code ticket
    │   │   ├── Admin/             # Admin dashboard with KPIs and management tabs
    │   │   └── Auth/              # Login & Register with demo credentials
    │   ├── services/api.js        # Axios instance with auth interceptors
    │   ├── store/                 # Redux Toolkit store and slices
    │   ├── App.jsx                # Router configuration
    │   └── main.jsx               # App entry with Redux and ToastContainer
    └── package.json
```
