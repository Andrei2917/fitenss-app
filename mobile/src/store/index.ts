import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // We will add coachReducer and videoReducer here later!
  },
});

// Types for TypeScript to understand our store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;