import { createSlice } from '@reduxjs/toolkit'

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    nowPlaying: [],
    upcoming: [],
    searchResults: [],
    selectedMovie: null,
    genres: [],
    loading: false,
    searchLoading: false,
    error: null,
    filters: {
      genre: '',
      language: '',
      status: 'Now Showing',
      sort: '-createdAt',
    },
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    setTrending: (state, action) => { state.trending = action.payload },
    setNowPlaying: (state, action) => { state.nowPlaying = action.payload },
    setUpcoming: (state, action) => { state.upcoming = action.payload },
    setSearchResults: (state, action) => { state.searchResults = action.payload },
    setSelectedMovie: (state, action) => { state.selectedMovie = action.payload },
    setGenres: (state, action) => { state.genres = action.payload },
    setLoading: (state, action) => { state.loading = action.payload },
    setSearchLoading: (state, action) => { state.searchLoading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    setPagination: (state, action) => { state.pagination = action.payload },
  },
})

export const {
  setTrending, setNowPlaying, setUpcoming, setSearchResults,
  setSelectedMovie, setGenres, setLoading, setSearchLoading,
  setError, setFilters, setPagination,
} = movieSlice.actions
export default movieSlice.reducer
