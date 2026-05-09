import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { Clock, ChevronRight, Video, Scissors, CheckCircle2 } from 'lucide-react-native';

interface Task {
  id: string;
  type: 'SHOOT' | 'EDIT';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string;
  lead?: {
    name: string;
    business: string;
  };
}

export default function ProductionTasks() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchTasks = async (isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const endpoint = isAdminOrManager ? '/tasks' : '/tasks/my';
      const res = await apiClient.get(endpoint);
      const resData = res.data;

      if (resData?.data) {
        setTasks(resData.data);
      } else if (Array.isArray(resData)) {
        setTasks(resData);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTasks();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return Colors.success;
      case 'IN_PROGRESS': return Colors.warning;
      default: return Colors.videographer;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.videographer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>{tasks.length} assignment{tasks.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTasks(true)}
            tintColor={Colors.videographer}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <CheckCircle2 size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No tasks assigned yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'COMPLETED';
          const isToday = new Date(item.deadline).toDateString() === new Date().toDateString();
          const statusColor = getStatusColor(item.status);

          return (
            <TouchableOpacity
              style={[styles.taskCard, isOverdue && styles.overdueCard]}
              onPress={() => router.push(`/tasks/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.cardMain}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.typeTag}>
                    {item.type === 'SHOOT'
                      ? <Video size={12} color={Colors.videographer} />
                      : <Scissors size={12} color={Colors.editor} />}
                    <Text style={[
                      styles.typeTagText,
                      { color: item.type === 'SHOOT' ? Colors.videographer : Colors.editor }
                    ]}>
                      {item.type}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Client info */}
                <Text style={styles.clientName}>{item.lead?.name || 'Unknown Client'}</Text>
                <Text style={styles.businessName}>{item.lead?.business}</Text>

                {/* Footer row */}
                <View style={styles.cardFooter}>
                  <View style={styles.metaInfo}>
                    <Clock size={12} color={isOverdue ? Colors.error : Colors.textDark} />
                    <Text style={[styles.metaText, isOverdue && { color: Colors.error }]}>
                      {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                  {isToday && (
                    <View style={styles.todayFlag}>
                      <Text style={styles.todayFlagText}>DUE TODAY</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.chevron}>
                <ChevronRight size={20} color={Colors.border} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 4,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  overdueCard: {
    borderColor: Colors.error + '40',
    backgroundColor: Colors.error + '05',
  },
  cardMain: {
    flex: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clientName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  businessName: {
    color: Colors.textDim,
    fontSize: 13,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '600',
  },
  todayFlag: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  todayFlagText: {
    color: Colors.error,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chevron: {
    paddingRight: Spacing.md,
  },
  empty: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '600',
  },
});
