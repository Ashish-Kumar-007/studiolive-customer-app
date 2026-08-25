import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { Check } from 'lucide-react-native';

interface PackageCardProps {
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

export function PackageCard({ name, price, duration, features, isPopular = false, onSelect }: PackageCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.card, isPopular && styles.popularCard]} 
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={16} color={Colors.success} style={styles.icon} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.button, isPopular && styles.popularButton]}>
        <Text style={[styles.buttonText, isPopular && styles.popularButtonText]}>Select Package</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  popularCard: {
    borderColor: Colors.info,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.info,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: Colors.textDim,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popularButton: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  popularButtonText: {
    color: Colors.background,
  },
});
