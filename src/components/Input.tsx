import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps, StyleProp, TextStyle, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme, Spacing, Radius } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, style, multiline, secureTextEntry, ...props }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isSecure, setIsSecure] = useState(secureTextEntry || false);

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
          placeholderTextColor={theme.textDark}
          multiline={multiline}
          {...props}
          secureTextEntry={isSecure}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            {isSecure ? (
              <EyeOff size={20} color={theme.textDim} />
            ) : (
              <Eye size={20} color={theme.textDim} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    color: theme.textDim,
    fontSize: 12,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: theme.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 54,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    color: theme.text,
    fontSize: 16,
    flex: 1,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputError: {
    borderColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  eyeIcon: {
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
