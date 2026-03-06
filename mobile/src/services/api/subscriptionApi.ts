import { config } from '../../constants/config';

export const subscriptionApi = {
  redeemAccessCode: async (userId: string, code: string) => {
    const response = await fetch(`${config.API_URL}/subscriptions/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });

    const data = await response.json();
    // If the code is fake or already used, the backend will throw an error here!
    if (!response.ok) throw new Error(data.error || 'Failed to redeem code');
    
    return data; 
  },

  purchaseSubscription: async (userId: string, coachId: string) => {
    const response = await fetch(`${config.API_URL}/subscriptions/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coachId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to purchase subscription');
    return data;
  }
};