import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Platform, KeyboardAvoidingView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { ArrowLeft, RefreshCw, ShieldCheck, Lock, Sparkles } from 'lucide-react-native';
import { apiClient } from '../../src/api/client';
import Button from '../../src/components/AppButton';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Verify() {
  const { user, logout } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const displayEmail = (user?.email || emailParam) as string;
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste if possible (simplified)
      const val = value.charAt(value.length - 1);
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid Code', 'Please complete the 6-digit security sequence.');
      return;
    }

    setVerifying(true);
    try {
      const response = await apiClient.post('/auth/verify-email-otp', {
        email: displayEmail,
        token: otpString,
      });

      if (response.data.user) {
        const currentToken = useAuthStore.getState().token;
        if (currentToken) {
          await useAuthStore.getState().setAuth(response.data.user, currentToken);
        }
      }

      Alert.alert('Access Granted', 'Your identity has been verified.', [
        { text: 'Enter Dashboard', onPress: () => router.replace('/(app)') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'The security code provided is incorrect or expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      await apiClient.post('/auth/send-email-otp', { email: displayEmail });
      setTimer(60); // Longer cooldown for "elite" feel
      Alert.alert('New Code Dispatched', 'A fresh security token has been sent to your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Communication with secure servers failed.');
    }
  };

  return (
    <View style={styles.base}>
      <LinearGradient 
        colors={['#0F172A', '#1E1B4B', '#0F172A']} 
        style={styles.container}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <View style={styles.content}>
            <TouchableOpacity style={styles.backBtn} onPress={logout}>
              <ArrowLeft size={20} color="#94A3B8" />
              <Text style={styles.backText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.mainCard}>
              <View style={styles.header}>
                <View style={styles.glowContainer}>
                  <View style={styles.iconGlow} />
                  <Lock size={36} color="#818CF8" />
                </View>
                <Text style={styles.title}>Secure Access</Text>
                <Text style={styles.subtitle}>
                  We've transmitted a digital key to:{"\n"}
                  <Text style={styles.emailHighlight}>{displayEmail}</Text>
                </Text>
              </View>

              <View style={styles.otpGrid}>
                {otp.map((digit, i) => (
                  <View key={i} style={[styles.otpWrapper, digit !== '' && styles.otpWrapperActive]}>
                    <TextInput
                      ref={(el) => (inputRefs.current[i] = el as any)}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, i)}
                      onKeyPress={(e) => handleKeyPress(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      placeholder="•"
                      placeholderTextColor="rgba(255,255,255,0.1)"
                      selectionColor="#818CF8"
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                onPress={handleVerifyOtp}
                disabled={verifying}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.submitBtn}
                >
                  {verifying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Verify Identity</Text>
                      <Sparkles size={16} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <TouchableOpacity 
                  onPress={handleResendOtp}
                  disabled={timer > 0}
                  style={styles.resendBtn}
                >
                  <RefreshCw size={14} color={timer > 0 ? '#475569' : '#818CF8'} />
                  <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                    {timer > 0 ? `Retry available in ${timer}s` : 'Request New Token'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: Radius.xxxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glowContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    opacity: 0.2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  emailHighlight: {
    color: '#818CF8',
    fontWeight: '800',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpWrapper: {
    width: (width - Spacing.xl * 4 - 40) / 6,
    height: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpWrapperActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  otpInput: {
    width: (width - Spacing.xl * 4 - 40) / 6,
    height: 60,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    padding: 0,
    includeFontPadding: false,
  },
  submitBtn: {
    height: 58,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#818CF8',
  },
  resendDisabled: {
    color: '#475569',
  },
});
