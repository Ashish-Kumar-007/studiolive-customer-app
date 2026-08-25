import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, isActive = false, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
