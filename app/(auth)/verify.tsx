import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';
import { ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useAlert } from '../../src/components/AlertModal';

export default function VerifyOTP() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const { setAuth } = useAuthStore();
  const { showAlert, AlertDialog } = useAlert();
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);

    try {
      // Because backend is mocked/delinked, we just call the mock login endpoint
      const response = await apiClient.post('/auth/login', { phone, otp });
      const { user, token } = response.data;
      
      await setAuth(user, token);
      router.replace('/');
    } catch (error) {
      showAlert({ title: 'Verification Failed', message: 'Invalid OTP entered. Please try again.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(30);
    // In real app, call resend API here
    showAlert({ title: 'OTP Sent', message: 'A new OTP has been sent to your mobile number.', variant: 'info' });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Verify Mobile</Text>
            <Text style={styles.description}>
              Enter the 4-digit OTP sent to <Text style={styles.highlight}>+91 {phone}</Text>
            </Text>

            <Input
              label="OTP"
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={styles.otpInput}
            />

            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading || otp.length < 4}
              activeOpacity={0.8}
              style={[styles.verifyButton, (otp.length < 4) && styles.disabledButton]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Verify & Proceed</Text>
                  <ChevronRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the OTP? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertDialog />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  content: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textDim,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  highlight: {
    color: Colors.text,
    fontWeight: '800',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '800',
  },
  verifyButton: {
    height: 56,
    backgroundColor: Colors.info,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  resendText: {
    color: Colors.textDim,
    fontSize: 14,
  },
  timerText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  resendLink: {
    color: Colors.info,
    fontSize: 14,
    fontWeight: '800',
  },
});
