import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style
        ]}
        placeholderTextColor={colors.textLight}
        // Tells screen readers what this input is for
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={`Enter ${label.toLowerCase()}`}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.size.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error, // Turns the border red on error
  },
  errorText: {
    color: colors.error,
    fontSize: theme.typography.size.xs,
    marginTop: theme.spacing.xs,
  },
});