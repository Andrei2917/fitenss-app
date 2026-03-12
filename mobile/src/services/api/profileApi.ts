import { config } from '../../constants/config';

export const clientProfileApi = {
  // Save profile data to backend
  saveProfile: async (userId: string, data: {
    sex: string;
    age: string;
    height: string;
    weight: string;
    goals: string[];
  }) => {
    const response = await fetch(`${config.API_URL}/profile/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to save profile');
    return result;
  },

  // Check if profile is completed
  checkProfileStatus: async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.API_URL}/profile/users/${userId}/profile-status`);
      const data = await response.json();
      return data.profileCompleted === true;
    } catch {
      return false;
    }
  },
};