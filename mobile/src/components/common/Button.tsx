import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  style, 
  disabled, 
  ...props 
}) => {
  // Determine colors based on the chosen variant
  const getBackgroundColor = () => {
    if (variant === 'secondary') return colors.secondary;
    if (variant === 'outline') return 'transparent';
    return colors.primary;
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.primary;
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      // Accessibility best practices for screen readers
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled, busy: isLoading }}
      accessibilityLabel={title}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  outlineBorder: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
  },
});