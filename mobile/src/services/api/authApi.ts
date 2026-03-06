import { config } from '../../constants/config';
import { LoginCredentials, RegisterCredentials, CoachRegisterCredentials, AuthResponse, CoachAuthResponse } from '../../types/auth.types';

export const authApi = {
  // --- CLIENT ROUTES ---
  loginUser: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${config.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  registerUser: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${config.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  // --- COACH ROUTES ---
  loginCoach: async (credentials: LoginCredentials): Promise<CoachAuthResponse> => {
    const response = await fetch(`${config.API_URL}/auth/coach/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to login as coach');
    return data;
  },

  registerCoach: async (credentials: CoachRegisterCredentials): Promise<CoachAuthResponse> => {
    const response = await fetch(`${config.API_URL}/auth/coach/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register as coach');
    return data;
  },
};

export const coachApi = {
  getAllCoaches: async () => {
    const response = await fetch(`${config.API_URL}/coaches`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch coaches');
    return data;
  },
};

export const profileApi = {
  uploadAvatar: async (userId: string, role: string, imageUri: string) => {
    // 1. Create a FormData object (required for sending files over HTTP)
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('role', role);

    // 2. Extract the file extension and name from the local phone URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // 3. Append the image file itself
    formData.append('image', { 
      uri: imageUri, 
      name: filename, 
      type 
    } as any);

    // 4. Send it to our backend route!
    // UPDATED: Now hitting /auth/upload-avatar to perfectly match authRoutes.ts
    const response = await fetch(`${config.API_URL}/auth/upload-avatar`, {
      method: 'POST',
      body: formData,
      // CRITICAL FIX: We completely omit the 'headers' block here. 
      // React Native will automatically generate the multipart boundary for us!
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload avatar');
    
    // Returns the secure Cloudinary URL so we can display it!
    return data.profilePictureUrl; 
  }
};