import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { ChevronRight } from 'lucide-react-native';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (!phone || phone.length < 10) return;
    setLoading(true);
    
    // Mocking an API call to send OTP
    setTimeout(() => {
      setLoading(false);
      router.push(`/verify?phone=${encodeURIComponent(phone)}`);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/icon_only.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logo}>STUDIO<Text style={styles.logoHighlight}>LIVE</Text></Text>
            <Text style={styles.subtitle}>INDIA'S #1 PHOTOGRAPHY PLATFORM</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Login or Signup</Text>
            <Text style={styles.description}>
              Enter your mobile number to receive a secure OTP and access your bookings.
            </Text>

            <View style={styles.inputWrapper}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <Input
                label=""
                placeholder="Mobile Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.phoneInput}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || phone.length < 10}
              activeOpacity={0.8}
              style={[styles.loginButton, (phone.length < 10) && styles.disabledButton]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Continue</Text>
                  <ChevronRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 2,
  },
  logoHighlight: {
    color: Colors.info,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textDim,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  countryCode: {
    height: 56,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRightWidth: 0,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
    marginTop: 6, 
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  loginButton: {
    height: 56,
    backgroundColor: Colors.info,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
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
  termsContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: Colors.info,
    fontWeight: '700',
  },
});
