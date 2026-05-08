import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { Mail, LogOut } from 'lucide-react-native';
import { apiClient } from '../../src/api/client';
import Button from '../../src/components/AppButton';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Verify() {
  const { user, setAuth, logout, token } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setVerifying(true);
    try {
      const response = await apiClient.post('/auth/verify-email-otp', {
        email: user?.email,
        token: otp,
        userId: user?.id
      });

      Alert.alert('Success', 'Email verified successfully!', [
        {
          text: 'Get Started',
          onPress: async () => {
            const updatedUser = {
              ...user,
              emailVerified: true,
              needsVerification: false,
              isFirstLogin: false
            };
            const storedToken = await SecureStore.getItemAsync('access_token') || token;
            await setAuth(updatedUser as any, storedToken || '');
            router.replace('/(app)');
          }
        }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid or expired code.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await apiClient.post('/auth/send-email-otp', { email: user?.email });
      Alert.alert('Success', 'A new 6-digit code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Mail size={40} color={Colors.admin} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          We've sent a 6-digit verification code to:{"\n"}
          <Text style={styles.email}>{user?.email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor={Colors.textDark}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <Button
          title="Verify Account"
          onPress={handleVerifyOtp}
          loading={verifying}
          style={styles.verifyBtn}
        />

        <TouchableOpacity style={styles.resendBtn} onPress={handleResendOtp}>
          <Text style={styles.resendText}>Didn't get a code? <Text style={styles.resendHighlight}>Resend</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color={Colors.textDim} />
          <Text style={styles.logoutText}>Sign out and try another email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.admin + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  description: {
    color: Colors.textDim,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  email: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  otpContainer: {
    width: '100%',
    marginVertical: Spacing.xl,
  },
  otpInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyBtn: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  resendBtn: {
    marginBottom: Spacing.xl,
  },
  resendText: {
    color: Colors.textDim,
    fontSize: 14,
  },
  resendHighlight: {
    color: Colors.admin,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: Colors.textDim,
    fontSize: 14,
  },
});
