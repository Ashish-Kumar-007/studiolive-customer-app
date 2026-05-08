import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radius, Spacing } from '../../src/constants/theme';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { Input } from '../../src/components/Input';

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, token, setAuth } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.patch('/auth/change-password', { newPassword: password });
      if (user && token) {
        await setAuth({ ...user, isFirstLogin: false }, token);
      }
      Alert.alert('Success', 'Password updated successfully.', [
        { text: 'Continue to Dashboard', onPress: () => router.replace('/(app)') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <LinearGradient
            colors={[theme.manager + '20', theme.manager + '05']}
            style={styles.iconWrap}
          >
            <ShieldCheck size={40} color={theme.manager} />
          </LinearGradient>
          
          <View style={styles.header}>
            <Text style={styles.title}>Secure Your Account</Text>
            <Text style={styles.subtitle}>Please set a strong password to continue to your workspace.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Min 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={submitting}
              activeOpacity={0.8}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={[theme.admin, theme.admin + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Update & Continue</Text>
                    <Lock size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>This is a one-time requirement for first-time login security.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: theme.textDim,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: theme.admin,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: Spacing.lg,
  },
  footerText: {
    color: theme.textDark,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
