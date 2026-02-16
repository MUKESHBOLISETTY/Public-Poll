import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  loading: false,
  token: localStorage.getItem("token") ? localStorage.getItem("token") : null,
  email: localStorage.getItem("email") ? localStorage.getItem("email") : null,
  user: null,
  error: null,
  navigation: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, value) {
      state.user = value.payload;
    },
    setNavigation(state, value) {
      state.navigation = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
    setEmail(state, value) {
      state.email = value.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetAuth: (state) => {
      state.token = null;
      state.email = null;
      state.user = null;
    }
  },
});

export const { setLoading, setToken, setEmail, setUser, setError, resetAuth, setNavigation } = authSlice.actions;

export default authSlice.reducer;