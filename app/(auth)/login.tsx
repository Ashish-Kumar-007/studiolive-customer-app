import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Fingerprint, Shield, Mail, Lock as LockIcon, ChevronRight } from 'lucide-react-native';

export default function Login() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBioAvailable, setIsBioAvailable] = useState(false);
  const { setAuth, biometricsEnabled, setBiometricsEnabled } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBioAvailable(hasHardware && isEnrolled);
  };

  const handleBiometricLogin = async () => {
    if (!biometricsEnabled) {
      Alert.alert('Not Enabled', 'Please login manually first and enable biometrics in settings.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authorize access',
      fallbackLabel: 'Use Password',
    });

    if (result.success) {
      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedPassword = await SecureStore.getItemAsync('user_password');

      if (storedEmail && storedPassword) {
        performLogin(storedEmail, storedPassword);
      } else {
        Alert.alert('Sync Required', 'Please login manually to re-sync biometrics.');
      }
    }
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { user, access_token, needsVerification } = response.data;

      await setAuth(user, access_token);

      // Always save credentials for biometric re-auth
      await SecureStore.setItemAsync('user_email', loginEmail);
      await SecureStore.setItemAsync('user_password', loginPassword);

      // Auto-offer biometrics on first successful login if not yet enabled
      if (isBioAvailable && !biometricsEnabled) {
        Alert.alert(
          'Enable Touch ID?',
          'Use fingerprint or face recognition for faster sign-in next time.',
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                await setBiometricsEnabled(true);
              },
            },
          ]
        );
      }

      if (needsVerification) {
        try {
          await apiClient.post('/auth/send-email-otp', { email: loginEmail });
        } catch (_) { }
        setTimeout(() => router.replace('/(auth)/verify'), 0);
      } else {
        setTimeout(() => router.replace('/'), 0);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '';
      const isUnverifiedEmail =
        message.toLowerCase().includes('email not confirmed') ||
        message.toLowerCase().includes('not verified') ||
        message.toLowerCase().includes('email not verified');

      if (isUnverifiedEmail) {
        const responseData = error.response?.data;
        if (responseData?.user && responseData?.access_token) {
          await setAuth(responseData.user, responseData.access_token);
        }
        try {
          await apiClient.post('/auth/send-email-otp', { email: loginEmail });
        } catch (_) { }
        setTimeout(() => router.replace({ pathname: '/(auth)/verify', params: { email: loginEmail } }), 0);
        return;
      }

      Alert.alert('Access Denied', message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    if (!email || !password) return;
    performLogin(email, password);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0F172A', '#1E1B4B']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../assets/icon-only.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.logo}>STUDIO<Text style={styles.logoHighlight}>LIVE</Text></Text>
              <Text style={styles.subtitle}>ELITE PRODUCTION OS</Text>
            </View>

            <View style={styles.content}>
              {isBioAvailable && biometricsEnabled && (
                <View style={styles.bioSection}>
                  <TouchableOpacity
                    style={styles.bioMainTrigger}
                    onPress={handleBiometricLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bioIconContainer}>
                      <Fingerprint color="#FFFFFF" size={56} />
                      <View style={styles.bioPulse} />
                    </View>
                    <Text style={styles.bioText}>Touch ID to Sign In</Text>
                  </TouchableOpacity>

                  <View style={styles.minimalDivider}>
                    <View style={styles.dot} />
                    <Text style={styles.dividerLabel}>OR CONTINUE MANUALLY</Text>
                    <View style={styles.dot} />
                  </View>
                </View>
              )}

              <View style={styles.manualSection}>
                <Input
                  label="CREDENTIAL IDENTITY"
                  placeholder="name@studiolive.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Input
                  label="SECURITY KEY"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TouchableOpacity
                  onPress={handleManualLogin}
                  disabled={loading || !email || !password}
                  activeOpacity={0.8}
                  style={[styles.loginButton, (!email || !password) && styles.disabledButton]}
                >
                  <LinearGradient
                    colors={['#4338CA', '#3730A3']}
                    style={styles.gradientButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>Authorize Entry</Text>
                        <ChevronRight size={18} color="#ffffff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>SYSTEM v1.0.4-ELITE // SECURE CONNECTION</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)',
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
    zIndex: 2,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 4,
  },
  logoHighlight: {
    color: theme.admin,
  },
  subtitle: {
    color: theme.textDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  bioSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bioMainTrigger: {
    alignItems: 'center',
    gap: 20,
  },
  bioIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  bioPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.admin,
    opacity: 0.1,
  },
  bioText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  minimalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 40,
  },
  dividerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.textDark,
    letterSpacing: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
  },
  manualSection: {
    gap: 10,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradientButton: {
    height: 60,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: theme.textDark,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
