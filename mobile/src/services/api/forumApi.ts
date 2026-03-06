import { config } from '../../constants/config'; // Adjust this import if your config file is located elsewhere

export const forumApi = {
  getPosts: async () => {
    const response = await fetch(`${config.API_URL}/forum/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
  
  getPostById: async (id: string) => {
    const response = await fetch(`${config.API_URL}/forum/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  createPost: async (data: { title: string; content: string; userId?: string; coachId?: string }) => {
    const response = await fetch(`${config.API_URL}/forum/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  createComment: async (postId: string, data: { content: string; userId?: string; coachId?: string }) => {
    const response = await fetch(`${config.API_URL}/forum/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  }
};