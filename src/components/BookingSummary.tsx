import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';
import { Receipt } from 'lucide-react-native';

interface BookingSummaryProps {
  serviceName: string;
  packageName: string;
  price: number;
  date?: string;
  time?: string;
}

export function BookingSummary({ serviceName, packageName, price, date, time }: BookingSummaryProps) {
  const tax = price * 0.18;
  const total = price + tax;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Receipt size={20} color={Colors.text} />
        <Text style={styles.title}>Booking Summary</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{serviceName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Package</Text>
        <Text style={styles.value}>{packageName}</Text>
      </View>

      {date && time && (
        <View style={styles.scheduleBox}>
          <Text style={styles.scheduleText}>{date} at {time}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>${price.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tax (18%)</Text>
        <Text style={styles.value}>${tax.toFixed(2)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.rowTotal}>
        <Text style={styles.totalLabel}>Total Due</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.textDim,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700',
  },
  scheduleBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.info,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.info,
  },
});
