import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ProjectCardProps {
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  onPress: () => void;
}

export function ProjectCard({ title, category, location, imageUrl, onPress }: ProjectCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground} resizeMode="cover">
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 250,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  categoryText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    color: '#EEEEEE',
    fontSize: 14,
  },
});
