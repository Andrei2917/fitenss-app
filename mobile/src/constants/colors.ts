export const colors = {
  // --- Client Brand Colors ---
  primary: '#21277B',       // The deep dark blue
  secondary: '#5F83B1',     // The muted light blue
  white: '#FFFFFF',         // Pure white
  
  // --- Gradients/Accents (Based on the bottom spheres) ---
  accentLight: '#4A90E2',   // A bright sky blue for active states
  accentIce: '#E8F0F9',     // A very faint blue for subtle backgrounds

  // --- Standard UI Colors ---
  background: '#F8F9FA',    // Off-white for the main app background
  text: '#1A1A1A',          // Almost black for highly readable text
  textLight: '#6B7280',     // Gray for placeholders and secondary text
  border: '#E5E7EB',        // Light gray for input borders
  error: '#EF4444',         // Red for login errors
  success: '#10B981',       // Green for success messages
};

// Typescript type so your editor autocompletes color names!
export type ColorTheme = typeof colors;