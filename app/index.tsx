import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/constants/theme';

/**
 * Root Index is just a loading placeholder.
 * All navigation logic is handled in the root _layout.tsx
 * to prevent redirect loops.
 */
export default function Index() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.admin} />
    </View>
  );
}
