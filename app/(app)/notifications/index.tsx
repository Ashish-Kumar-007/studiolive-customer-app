import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { Bell, Check } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiClient.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (_) {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark all as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      // Mark all as read after a brief delay
      const timer = setTimeout(async () => {
        try {
          await apiClient.post('/notifications/read-all');
        } catch (_) {}
      }, 1000);
      return () => clearTimeout(timer);
    }, [isAuthenticated])
  );

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case 'TASK_ASSIGNED': return theme.videographer;
      case 'LEAD_TRANSFER': return theme.marketing;
      default: return theme.admin;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.admin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications(true)} tintColor={theme.admin} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell size={40} color={theme.textDark} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.unreadCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeDot, { backgroundColor: getTypeColor(item.type) }]} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.isRead && <Check size={14} color={theme.success} />}
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>
              {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  list: { padding: Spacing.md },
  card: {
    backgroundColor: theme.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: Spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.admin,
    backgroundColor: theme.admin + '08',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  cardMessage: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  cardTime: {
    color: theme.textDark,
    fontSize: 10,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: theme.textDark,
    fontSize: 14,
  },
});
