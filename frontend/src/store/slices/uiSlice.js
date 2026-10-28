import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    searchOpen: false,
    notificationsOpen: false,
    modalOpen: null, // modal name
    theme: 'dark',
    city: localStorage.getItem('imovies_city') || 'Mumbai',
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen },
    openModal: (state, action) => { state.modalOpen = action.payload },
    closeModal: (state) => { state.modalOpen = null },
    setCity: (state, action) => {
      state.city = action.payload
      localStorage.setItem('imovies_city', action.payload)
    },
  },
})

export const {
  toggleSidebar, setSidebar, toggleSearch, toggleNotifications,
  openModal, closeModal, setCity,
} = uiSlice.actions
export default uiSlice.reducer
