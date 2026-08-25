import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { ArrowLeft, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react-native';
import Button from '../../../src/components/AppButton';
import { BookingSummary } from '../../../src/components/BookingSummary';

export default function CheckoutScreen() {
  const { id, packageId, date, time } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock data for checkout
  const mockService = "Wedding Photography";
  const mockPackage = packageId === 'pkg_2' ? "Premium Wedding Story" : "Essential Wedding";
  const mockPrice = packageId === 'pkg_2' ? 120000 : 50000;
  const tax = mockPrice * 0.18;
  const total = mockPrice + tax;

  const handlePayment = () => {
    setLoading(true);
    // Simulate Razorpay / Payment Gateway processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  const handleReturnHome = () => {
    router.replace('/');
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <CheckCircle size={80} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>
            Your booking for {mockService} has been confirmed for {date} at {time}. We have sent the receipt to your registered mobile number.
          </Text>
          
          <View style={styles.bookingRef}>
            <Text style={styles.refLabel}>Booking Reference</Text>
            <Text style={styles.refValue}>#STDLV-{Math.floor(100000 + Math.random() * 900000)}</Text>
          </View>

          <Button 
            title="Return to Home" 
            onPress={handleReturnHome}
            style={styles.returnButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.trustBanner}>
          <ShieldCheck size={20} color={Colors.success} />
          <Text style={styles.trustText}>100% Secure Payment powered by Razorpay</Text>
        </View>

        <BookingSummary 
          serviceName={mockService}
          packageName={mockPackage}
          price={mockPrice}
          date={date as string}
          time={time as string}
        />

        <View style={styles.paymentMethodContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentCardInner}>
              <CreditCard size={24} color={Colors.info} />
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentName}>UPI / Credit / Debit Card</Text>
                <Text style={styles.paymentSub}>Processed securely via Razorpay</Text>
              </View>
            </View>
            <View style={styles.radioSelected}>
              <View style={styles.radioInner} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total Pay</Text>
          <Text style={styles.footerTotalValue}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    marginBottom: Spacing.xl,
    gap: 8,
  },
  trustText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  paymentMethodContainer: {
    marginTop: Spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.info,
  },
  paymentCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paymentDetails: {
    justifyContent: 'center',
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  paymentSub: {
    fontSize: 12,
    color: Colors.textDim,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.info,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 12,
    color: Colors.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  payButton: {
    flex: 1,
    backgroundColor: Colors.info,
    height: 56,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.lg,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  successIconWrapper: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  successDesc: {
    fontSize: 15,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  bookingRef: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  refLabel: {
    fontSize: 12,
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  refValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 2,
  },
  returnButton: {
    width: '100%',
  },
});
