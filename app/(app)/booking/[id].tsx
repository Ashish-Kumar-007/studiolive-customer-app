import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { CalendarView } from '../../../src/components/CalendarView';
import { BookingSummary } from '../../../src/components/BookingSummary';
import Button from '../../../src/components/AppButton';
import { ArrowLeft } from 'lucide-react-native';

export default function BookingScreen() {
  const { id, packageId } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  // Mock data for the booking flow
  const mockService = "Wedding Photography";
  const mockPackage = packageId === 'pkg_2' ? "Premium Wedding Story" : "Essential Wedding";
  const mockPrice = packageId === 'pkg_2' ? 120000 : 50000;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Incomplete Booking', 'Please select a date and time for your booking.');
      return;
    }
    
    // Proceed to next step (Auth or Checkout)
    Alert.alert(
      'Booking Initiated', 
      `Proceeding to checkout for ${selectedDate} at ${selectedTime}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionDescription}>
          Select your preferred date and time for the {mockService} session.
        </Text>

        <CalendarView 
          onSelectDate={(date) => setSelectedDate(date.toLocaleDateString())}
          onSelectTime={(time) => setSelectedTime(time)}
        />

        <View style={styles.summaryContainer}>
          <BookingSummary 
            serviceName={mockService}
            packageName={mockPackage}
            price={mockPrice}
            date={selectedDate}
            time={selectedTime}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Proceed to Checkout" 
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime}
          style={(!selectedDate || !selectedTime) ? styles.disabledButton : undefined}
        />
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
  sectionDescription: {
    fontSize: 15,
    color: Colors.textDim,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  summaryContainer: {
    marginTop: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  disabledButton: {
    opacity: 0.5,
  }
});
