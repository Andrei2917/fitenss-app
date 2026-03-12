import { config } from '../../constants/config';
import { Coach } from '../../types/auth.types'; 

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

  // Get full coach public profile
  getCoachProfile: async (coachId: string) => {
    const response = await fetch(`${config.API_URL}/coaches/${coachId}/profile`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  // Update coach profile (text fields)
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

  // Upload cover image for coach
  uploadCoverImage: async (coachId: string, imageUri: string) => {
    const formData = new FormData();
    formData.append('coachId', coachId);
    
    const filename = imageUri.split('/').pop() || 'cover.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('coverImage', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${config.API_URL}/coaches/${coachId}/cover-image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload cover image');
    return data.coverImageUrl;
  },

  // Check if user is subscribed to coach
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
  }
};