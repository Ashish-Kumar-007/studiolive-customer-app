import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { CheckCircle2, Clock, PlayCircle, Calendar, ChevronRight } from 'lucide-react-native';

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
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchTasks = async (pageNum = 1, isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);

    try {
      const endpoint = isAdminOrManager ? '/tasks' : '/tasks/my';
      const res = await apiClient.get(endpoint, { params: { page: pageNum, limit: 10 } });

      const resData = res.data;
      if (resData?.data && resData?.meta) {
        if (isRefresh || pageNum === 1) {
          setTasks(resData.data);
        } else {
          setTasks(prev => [...prev, ...resData.data]);
        }
        setLastPage(resData.meta.lastPage);
      } else if (Array.isArray(resData)) {
        setTasks(resData);
        setLastPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setPage(1);
    fetchTasks(1);
  }, [isAuthenticated]);

  const loadMore = () => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchTasks(next);
    }
  };

  const updateStatus = async (taskId: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'ASSIGNED') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else return;

    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      fetchTasks(1, true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: Colors.success, bg: Colors.success + '15' };
      case 'IN_PROGRESS': return { color: Colors.warning, bg: Colors.warning + '15' };
      default: return { color: Colors.textDim, bg: Colors.surfaceLight };
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.videographer} />
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: Task }) => {
    const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'COMPLETED';
    const isToday = new Date(item.deadline).toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity 
        style={[styles.taskCard, isOverdue && styles.overdueCard]}
        onPress={() => router.push(`/(app)/tasks/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <View style={styles.typeTag}>
              <PlayCircle size={12} color={item.type === 'SHOOT' ? Colors.videographer : Colors.editor} />
              <Text style={[styles.typeTagText, { color: item.type === 'SHOOT' ? Colors.videographer : Colors.editor }]}>{item.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(item.status).bg }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusStyle(item.status).color }]}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.clientName}>{item.lead?.name}</Text>
          <Text style={styles.businessName}>{item.lead?.business}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.metaInfo}>
              <Clock size={12} color={isOverdue ? Colors.error : Colors.textDark} />
              <Text style={[styles.metaText, isOverdue && { color: Colors.error }]}>
                {new Date(item.deadline).toLocaleDateString()}
              </Text>
            </View>
            {isToday && <View style={styles.todayFlag}><Text style={styles.todayFlagText}>DUE TODAY</Text></View>}
          </View>
        </View>
        <View style={styles.chevron}>
          <ChevronRight size={20} color={Colors.border} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(1, true)} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks assigned to you.</Text>
          </View>
        }
        renderItem={renderTaskItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
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
    letterSpacing: 1,
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
    paddingVertical: 120, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  emptyText: { 
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
});
