import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps, StyleProp, TextStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, style, multiline, ...props }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        error ? styles.inputError : null,
        multiline && styles.inputContainerMultiline
      ]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={Colors.textDark}
          multiline={multiline}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    color: Colors.textDim,
    fontSize: 12,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 54,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  inputContainerMultiline: {
    justifyContent: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    color: Colors.text,
    fontSize: 16,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
