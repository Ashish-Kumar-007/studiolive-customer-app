import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/constants/theme';

/**
 * Root Index is just a loading placeholder.
 * All navigation logic is handled in the root _layout.tsx
 * to prevent redirect loops.
 */
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color={Colors.admin} />
    </View>
  );
}
