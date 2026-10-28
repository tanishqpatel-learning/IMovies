import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import movieReducer from './slices/movieSlice'
import bookingReducer from './slices/bookingSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    booking: bookingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['booking/setBookingData'],
        ignoredPaths: ['booking.selectedShow.date'],
      },
    }),
})
