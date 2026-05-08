import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import Button from '../../src/components/AppButton';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, access_token, needsVerification } = response.data;

      await setAuth(user, access_token);

      if (needsVerification) {
        // Auto-send OTP before navigating to verify screen
        try {
          await apiClient.post('/auth/send-email-otp', { email });
        } catch (_) {}
        setTimeout(() => router.replace('/(auth)/verify'), 0);
      } else {
        setTimeout(() => router.replace('/'), 0);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '';
      const statusCode = error.response?.status;

      // Backend returns 401 with "email not confirmed" if the user hasn't verified yet.
      // Treat this the same as needsVerification: true — save partial auth and redirect to verify.
      const isUnverifiedEmail =
        message.toLowerCase().includes('email not confirmed') ||
        message.toLowerCase().includes('not verified') ||
        message.toLowerCase().includes('email not verified');

      if (isUnverifiedEmail) {
        // Try to save partial auth if the response included user/token data
        const responseData = error.response?.data;
        if (responseData?.user && responseData?.access_token) {
          await setAuth(responseData.user, responseData.access_token);
        }
        // Send OTP and navigate to verify, passing email as a param
        try {
          await apiClient.post('/auth/send-email-otp', { email });
        } catch (_) {}
        setTimeout(() => router.replace({ pathname: '/(auth)/verify', params: { email } }), 0);
        return;
      }

      Alert.alert('Login Failed', message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>STUDIO<Text style={styles.logoHighlight}>LIVE</Text></Text>
          <Text style={styles.subtitle}>Unified Production Management</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.description}>Sign in to access your dashboard</Text>

          <Input
            label="Email Address"
            placeholder="name@studiolive.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>DEMO ACCOUNTS</Text>
            <View style={styles.demoGrid}>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.admin }]} onPress={() => { setEmail('admin@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.admin }]}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.manager }]} onPress={() => { setEmail('ashish.manager@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.manager }]}>Manager</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.marketing }]} onPress={() => { setEmail('marketing@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.marketing }]}>Marktg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.receptionist }]} onPress={() => { setEmail('reception@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.receptionist }]}>Recept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.videographer }]} onPress={() => { setEmail('new@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.videographer }]}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.editor }]} onPress={() => { setEmail('editor@studiolive.com'); setPassword('password123'); }}>
                <Text style={[styles.demoBtnText, { color: Colors.editor }]}>Editor</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Need help? Contact your administrator</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed',
  },
  logoHighlight: {
    color: Colors.admin,
  },
  subtitle: {
    color: Colors.textDark,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 14,
    color: Colors.textDim,
    marginBottom: Spacing.xl,
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textDark,
    fontSize: 12,
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  demoTitle: {
    color: Colors.textDark,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
