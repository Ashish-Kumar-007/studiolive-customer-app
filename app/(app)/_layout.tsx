import { Tabs } from 'expo-router';
import { useTheme } from '../../src/constants/theme';
import { LayoutDashboard, Store, User } from 'lucide-react-native';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.info,
        tabBarInactiveTintColor: theme.textDark,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'STUDIOLIVE',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="shop/index"
        options={{
          title: 'Shop',
          headerTitle: 'STUDIO PRODUCTS',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />

      {/* Hide non-tab routes from the bottom bar */}
      <Tabs.Screen name="booking/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="checkout/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="cart/index" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="service/[id]" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
