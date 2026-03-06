import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
  role: 'client' | 'coach' | null; // <--- The Magic Key for Navigation
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  coach: null,
  token: null,
  role: null,
  isLoading: false,
  error: null,
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
    },
    clearError: (state) => {
      state.error = null;
    },
    // --- NEW: Instantly updates the UI when a photo finishes uploading ---
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        // @ts-ignore - Just in case TypeScript complains about the new field before types are updated
        state.user.profilePictureUrl = action.payload;
      } else if (state.coach) {
        // @ts-ignore
        state.coach.profilePictureUrl = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // --- CLIENT LOGIN & REGISTER ---
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = 'client'; // Sets the role!
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = 'client';
      })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      // --- COACH LOGIN & REGISTER ---
      .addCase(loginCoach.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginCoach.fulfilled, (state, action: PayloadAction<CoachAuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.coach = action.payload.coach;
        state.role = 'coach'; // Sets the role!
      })
      .addCase(loginCoach.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(registerCoach.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerCoach.fulfilled, (state, action: PayloadAction<CoachAuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.coach = action.payload.coach;
        state.role = 'coach';
      })
      .addCase(registerCoach.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  },
});

export const { logout, clearError, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;