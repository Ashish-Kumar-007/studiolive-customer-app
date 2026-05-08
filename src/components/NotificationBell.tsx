import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../api/client';
import { useTheme } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export function NotificationBell() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const res = await apiClient.get('/notifications');
        if (Array.isArray(res.data)) {
          setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        }
      } catch (_) {}
    };

    fetchCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(app)/notifications')}
    >
      <Bell size={22} color={theme.text} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
