import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors } from '../constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  readOnly?: boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onPress,
  readOnly = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={20} color={Colors.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        onPressIn={onPress}
        readOnly={readOnly}
        editable={!readOnly}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
});
