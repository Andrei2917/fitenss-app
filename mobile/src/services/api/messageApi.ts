import { config } from '../../constants/config';

export const messageApi = {
  // Send a message
  sendMessage: async (content: string, senderType: 'user' | 'coach', userId: string, coachId: string) => {
    const response = await fetch(`${config.API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, senderType, userId, coachId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  // Get all messages between a user and coach
  getMessages: async (userId: string, coachId: string) => {
    const response = await fetch(`${config.API_URL}/messages/${userId}/${coachId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
    return data;
  },

  // Get conversation list for a user (client)
  getUserConversations: async (userId: string) => {
    const response = await fetch(`${config.API_URL}/messages/conversations/user/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch conversations');
    return data;
  },

  // Get conversation list for a coach
  getCoachConversations: async (coachId: string) => {
    const response = await fetch(`${config.API_URL}/messages/conversations/coach/${coachId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch conversations');
    return data;
  },

  // Mark messages as read
  markAsRead: async (userId: string, coachId: string, readerType: 'user' | 'coach') => {
    const response = await fetch(`${config.API_URL}/messages/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coachId, readerType }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark as read');
    return data;
  },
};