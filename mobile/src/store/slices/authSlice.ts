import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../services/api/authApi';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  CoachRegisterCredentials,
  AuthResponse, 
  CoachAuthResponse,
  User,
  Coach
} from '../../types/auth.types';

// ==========================================
// HELPER: Persist auth state to SecureStore
// ==========================================
const persistAuth = async (token: string, role: string, userData: any) => {
  await SecureStore.setItemAsync('auth_token', token);
  await SecureStore.setItemAsync('auth_role', role);
  await SecureStore.setItemAsync('auth_user', JSON.stringify(userData));
};

const clearPersistedAuth = async () => {
  await SecureStore.deleteItemAsync('auth_token');
  await SecureStore.deleteItemAsync('auth_role');
  await SecureStore.deleteItemAsync('auth_user');
};

// ==========================================
// NEW: RESTORE SESSION THUNK
// ==========================================
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const role = await SecureStore.getItemAsync('auth_role');
      const userJson = await SecureStore.getItemAsync('auth_user');

      if (!token || !role || !userJson) {
        return rejectWithValue('No session found');
      }

      const userData = JSON.parse(userJson);
      return { token, role, userData };
    } catch (error: any) {
      return rejectWithValue('Failed to restore session');
    }
  }
);

// ==========================================
// 1. ASYNC THUNKS (CLIENT)
// ==========================================
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try { return await authApi.loginUser(credentials); } 
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try { return await authApi.registerUser(credentials); } 
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

// ==========================================
// 2. ASYNC THUNKS (COACH)
// ==========================================
export const loginCoach = createAsyncThunk(
  'auth/loginCoach',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try { return await authApi.loginCoach(credentials); } 
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

export const registerCoach = createAsyncThunk(
  'auth/registerCoach',
  async (credentials: CoachRegisterCredentials, { rejectWithValue }) => {
    try { return await authApi.registerCoach(credentials); } 
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

// ==========================================
// 3. STATE DEFINITION
// ==========================================
interface AuthState {
  user: User | null;
  coach: Coach | null;
  token: string | null;
  role: 'client' | 'coach' | null;
  isLoading: boolean;
  error: string | null;
  isRestoringSession: boolean;       // NEW: loading flag while checking SecureStore
  showWelcomeBack: boolean;          // NEW: triggers the "Welcome back" banner
}

const initialState: AuthState = {
  user: null,
  coach: null,
  token: null,
  role: null,
  isLoading: false,
  error: null,
  isRestoringSession: true,          // Start true – we always check on launch
  showWelcomeBack: false,
};

// ==========================================
// 4. THE SLICE (HANDLING RESPONSES)
// ==========================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.coach = null;
      state.token = null;
      state.role = null;
      state.error = null;
      state.showWelcomeBack = false;
      clearPersistedAuth(); // Wipe SecureStore on logout
    },
    clearError: (state) => {
      state.error = null;
    },
    dismissWelcomeBack: (state) => {
      state.showWelcomeBack = false;
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePictureUrl = action.payload;
      } else if (state.coach) {
        state.coach.profilePictureUrl = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // --- RESTORE SESSION ---
      .addCase(restoreSession.pending, (state) => {
        state.isRestoringSession = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        const { token, role, userData } = action.payload;
        state.token = token;
        state.role = role as 'client' | 'coach';
        if (role === 'coach') {
          state.coach = userData;
        } else {
          state.user = userData;
        }
        state.showWelcomeBack = true;  // Show "Welcome back" banner!
        state.isRestoringSession = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoringSession = false; // No session, go to login
      })

      // --- CLIENT LOGIN & REGISTER ---
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = 'client';
        state.showWelcomeBack = false;
        persistAuth(action.payload.token, 'client', action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = 'client';
        state.showWelcomeBack = false;
        persistAuth(action.payload.token, 'client', action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- COACH LOGIN & REGISTER ---
      .addCase(loginCoach.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginCoach.fulfilled, (state, action: PayloadAction<CoachAuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.coach = action.payload.coach;
        state.role = 'coach';
        state.showWelcomeBack = false;
        persistAuth(action.payload.token, 'coach', action.payload.coach);
      })
      .addCase(loginCoach.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(registerCoach.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerCoach.fulfilled, (state, action: PayloadAction<CoachAuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.coach = action.payload.coach;
        state.role = 'coach';
        state.showWelcomeBack = false;
        persistAuth(action.payload.token, 'coach', action.payload.coach);
      })
      .addCase(registerCoach.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, dismissWelcomeBack, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;