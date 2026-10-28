import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedMovie: null,
    selectedShow: null,
    selectedSeats: [],
    seatLayout: null,
    bookingData: null,
    currentBooking: null,
    myBookings: [],
    loading: false,
    error: null,
    step: 1, // 1: show select, 2: seat select, 3: payment, 4: confirmation
  },
  reducers: {
    setSelectedMovie: (state, action) => { state.selectedMovie = action.payload },
    setSelectedShow: (state, action) => {
      state.selectedShow = action.payload
      state.selectedSeats = []
    },
    toggleSeat: (state, action) => {
      const seat = action.payload
      const idx = state.selectedSeats.findIndex((s) => s.seatNumber === seat.seatNumber)
      if (idx > -1) {
        state.selectedSeats.splice(idx, 1)
      } else {
        if (state.selectedSeats.length < 8) { // max 8 seats per booking
          state.selectedSeats.push(seat)
        }
      }
    },
    clearSeats: (state) => { state.selectedSeats = [] },
    setSeatLayout: (state, action) => { state.seatLayout = action.payload },
    setBookingData: (state, action) => { state.bookingData = action.payload },
    setCurrentBooking: (state, action) => { state.currentBooking = action.payload },
    setMyBookings: (state, action) => { state.myBookings = action.payload },
    setStep: (state, action) => { state.step = action.payload },
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    resetBooking: (state) => {
      state.selectedShow = null
      state.selectedSeats = []
      state.seatLayout = null
      state.bookingData = null
      state.step = 1
    },
  },
})

export const {
  setSelectedMovie, setSelectedShow, toggleSeat, clearSeats, setSeatLayout,
  setBookingData, setCurrentBooking, setMyBookings, setStep,
  setLoading, setError, resetBooking,
} = bookingSlice.actions
export default bookingSlice.reducer
