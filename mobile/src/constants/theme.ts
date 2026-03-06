import { colors } from './colors';

export const theme = {
  colors,
  
  // Consistent spacing for margins and padding
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,    // Standard padding for most containers
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  
  // Consistent rounded corners for buttons and cards
  borderRadius: {
    sm: 4,
    md: 8,     // Standard for inputs
    lg: 12,    // Standard for buttons and cards
    xl: 16,
    round: 9999, // For circular profile pictures
  },
  
  // Consistent font sizes
  typography: {
    size: {
      xs: 12,
      sm: 14,
      md: 16,    // Standard body text
      lg: 18,
      xl: 24,    // Screen Titles
      xxl: 32,   // Large Headers
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    }
  }
};