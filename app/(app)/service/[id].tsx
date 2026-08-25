import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing } from '../../../src/constants/theme';
import { PackageCard } from '../../../src/components/PackageCard';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const MOCK_PACKAGES = [
  {
    id: 'pkg_1',
    name: 'Essential Wedding',
    price: '₹50,000',
    duration: '1 Day / 10 Hours',
    features: [
      '1 Traditional Photographer',
      '1 Candid Photographer',
      'High-res Digital Gallery (300+ photos)',
      'Basic Retouching'
    ],
    isPopular: false,
  },
  {
    id: 'pkg_2',
    name: 'Premium Wedding Story',
    price: '₹1,20,000',
    duration: '2 Days / 20 Hours',
    features: [
      '2 Candid Photographers',
      '1 Traditional Photographer',
      '1 Cinematographer (Wedding Film)',
      'Drone Coverage',
      'Premium Hardcover Album (40 Pages)',
      'High-res Digital Gallery (800+ photos)'
    ],
    isPopular: true,
  }
];

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800' }} 
            style={styles.heroImage} 
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.background} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Wedding Photography</Text>
          <Text style={styles.description}>
            Full day coverage so you do not miss the moments between the ceremony and celebration. 
            We capture authentic emotions, grand settings, and tiny details that make your day unique.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Package</Text>
            {MOCK_PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                name={pkg.name}
                price={pkg.price}
                duration={pkg.duration}
                features={pkg.features}
                isPopular={pkg.isPopular}
                onSelect={() => router.push(`/booking/${id}?packageId=${pkg.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  heroContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.border,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textDim,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
});
