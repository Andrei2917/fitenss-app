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
    
    // Returns the newly created code from the database!
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
      if (!response.ok) return []; // Returns an empty array if the backend route isn't built yet
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  // --- NEW: FETCH PREVIOUS ACCESS CODES ---
  getAccessCodes: async (coachId: string) => {
    try {
      const response = await fetch(`${config.API_URL}/coaches/${coachId}/codes`);
      if (!response.ok) return []; // Returns an empty array if the backend route isn't built yet
      return await response.json();
    } catch (error) {
      return [];
    }
  }
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
