import { configureStore } from "@reduxjs/toolkit"
import authReducer from './slices/authSlice';
import pollReducer from './slices/pollSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    poll: pollReducer
  },
})

export default store;
