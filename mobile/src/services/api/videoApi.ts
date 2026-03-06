import { config } from '../../constants/config';

export const videoApi = {
  // 1. The new lightweight Add Video Function
  uploadVideo: async (coachId: string, title: string, category: string, videoUri: string) => {
    const formData = new FormData();
    formData.append('coachId', coachId);
    formData.append('title', title);
    formData.append('category', category);
    
    const filename = videoUri.split('/').pop() || 'video.mp4';
    formData.append('videoFile', { uri: videoUri, name: filename, type: 'video/mp4' } as any);

    const response = await fetch(`${config.API_URL}/videos/upload`, {
      method: 'POST',
      body: formData, // <-- NO headers here! fetch handles FormData headers automatically.
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload video');
    return data;
  },

  getClientVideos: async (userId: string) => {
    const response = await fetch(`${config.API_URL}/videos/client/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch videos');
    return data; // Now returns { status, subscriptionId, coachName, videos }
  },

  purchaseSubscription: async (subscriptionId: string) => {
    const response = await fetch(`${config.API_URL}/videos/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Payment failed');
    return data;
  },

  // --- NEW COACH COMMANDS ---
  getCoachVideos: async (coachId: string) => {
    const response = await fetch(`${config.API_URL}/videos/coach/${coachId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch your videos');
    return data;
  },

  updateVideo: async (videoId: string, title: string, category: string) => {
    const response = await fetch(`${config.API_URL}/videos/${videoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update video');
    return data;
  },

  deleteVideo: async (videoId: string) => {
    const response = await fetch(`${config.API_URL}/videos/${videoId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete video');
    return data;
  },

  createPaymentIntent: async (subscriptionId: string) => {
    const response = await fetch(`${config.API_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to initialize payment');
    return data.clientSecret; // This is the secret ticket!
  }
};