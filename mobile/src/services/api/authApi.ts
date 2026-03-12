import { config } from '../../constants/config';
import { LoginCredentials, RegisterCredentials, CoachRegisterCredentials, AuthResponse, CoachAuthResponse } from '../../types/auth.types';
import { Coach } from '../../types/auth.types';

// =============================================
// AUTH API (login & register — used by authSlice)
// =============================================
export const authApi = {
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

// =============================================
// COACH API (coach-specific endpoints)
// =============================================
export const coachApi = {
  generateAccessCode: async (coachId: string) => {
    const response = await fetch(`${config.API_URL}/coaches/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate access code');
    return data.accessCode;
  },

  getAllCoaches: async (): Promise<Coach[]> => {
    const response = await fetch(`${config.API_URL}/coaches`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch coaches');
    return data;
  },

  getClients: async (coachId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/coaches/${coachId}/clients`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getAccessCodes: async (coachId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/coaches/${coachId}/codes`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getCoachProfile: async (coachId: string) => {
    const response = await fetch(`${config.API_URL}/coaches/${coachId}/profile`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  updateCoachProfile: async (coachId: string, profileData: any) => {
    const response = await fetch(`${config.API_URL}/coaches/${coachId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  checkSubscription: async (coachId: string, userId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/coaches/${coachId}/check-subscription/${userId}`);
      const data = await response.json();
      return data.isSubscribed;
    } catch (error) {
      return false;
    }
  },
};

// =============================================
// PROFILE API (avatar upload)
// =============================================
export const profileApi = {
  uploadAvatar: async (userId: string, role: string, imageUri: string) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('role', role);

    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${config.API_URL}/auth/upload-avatar`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload avatar');
    return data.profilePictureUrl;
  },
};

// =============================================
// SUBSCRIPTION API
// =============================================
export const subscriptionApi = {
  redeemCode: async (userId: string, code: string) => {
    const response = await fetch(`${config.API_URL}/subscriptions/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to redeem code');
    return data;
  },
};