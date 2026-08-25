import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/theme';

/**
 * Root index — just a placeholder.
 * _layout.tsx handles the actual redirection.
 */
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
}
