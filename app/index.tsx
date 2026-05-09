import { useState } from 'react';
import { View } from 'react-native';
import { Colors } from '../src/constants/theme';
import AnimatedSplash from '../src/components/AnimatedSplash';

/**
 * Root index — shows the animated splash, then the root _layout
 * takes over navigation based on auth state.
 */
export default function Index() {
  const [splashDone, setSplashDone] = useState(false);

  // While splash is animating, render it over a black bg
  if (!splashDone) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <AnimatedSplash onFinish={() => setSplashDone(true)} />
      </View>
    );
  }

  // Splash finished — render nothing; _layout.tsx redirects to login or app
  return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
}
