import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors, Spacing } from '../../src/constants/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { ServiceCard } from '../../src/components/ServiceCard';
import { ProjectCard } from '../../src/components/ProjectCard';
import { useRouter } from 'expo-router';
import { MapPin, User as UserIcon } from 'lucide-react-native';

const CATEGORIES = ['All', 'Weddings', 'Portraits', 'Events', 'Pre-Wedding'];

const FEATURED_PROJECTS = [
  {
    id: '1',
    title: 'Priya & Rahul Wedding',
    category: 'Wedding',
    location: 'Udaipur, Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
  },
];

const POPULAR_SERVICES = [
  {
    id: '1',
    title: 'Candid & Traditional Wedding',
    description: 'Full day coverage so you do not miss the moments between the ceremony and celebration.',
    price: '₹50,000',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Outdoor Portrait Session',
    description: 'Professional outdoor lighting setup for stunning personal or couple portraits.',
    price: '₹15,000',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.studioName}>StudioLive</Text>
          <View style={styles.locationContainer}>
            <MapPin size={12} color={Colors.textLight} />
            <Text style={styles.locationText}>Delhi NCR</Text>
          </View>
        </View>
        <UserIcon size={24} color={Colors.text} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search wedding photography..." 
            readOnly 
            onPress={() => router.push('/(app)/explore')} 
          />
        </View>

        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {CATEGORIES.map((cat) => (
              <CategoryChip 
                key={cat} 
                label={cat} 
                isActive={activeCategory === cat} 
                onPress={() => setActiveCategory(cat)} 
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          {FEATURED_PROJECTS.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              category={project.category}
              location={project.location}
              imageUrl={project.imageUrl}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          {POPULAR_SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              imageUrl={service.imageUrl}
              onPress={() => {}}
            />
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {},
  studioName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: Spacing.lg,
  },
});
