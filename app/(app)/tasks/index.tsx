import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { CheckCircle2, Clock, PlayCircle, Calendar, ChevronRight, Edit3, ArrowRightCircle, Plus } from 'lucide-react-native';

interface Task {
  id: string;
  type: 'SHOOT' | 'EDIT';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string;
  leadId: string;
  lead?: {
    name: string;
    business: string;
  };
}

export default function ProductionTasks() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchTasks = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);

    try {
      const endpoint = isAdminOrManager ? '/tasks' : '/tasks/my';
      const res = await apiClient.get(endpoint, { params: { page: pageNum, limit: 100 } });

      const resData = res.data;
      let rawData = [];
      if (resData?.data) {
        rawData = resData.data;
      } else if (Array.isArray(resData)) {
        rawData = resData;
      }

      const statusOrder: Record<string, number> = { 'IN_PROGRESS': 3, 'ASSIGNED': 2, 'COMPLETED': 1 };

      const leadMap = new Map<string, Task>();
      rawData.forEach((t: Task) => {
        const existing = leadMap.get(t.leadId);
        if (!existing) {
          leadMap.set(t.leadId, t);
        } else {
          if (t.type === 'EDIT' && existing.type === 'SHOOT') {
            leadMap.set(t.leadId, t);
          } else if (t.type === existing.type) {
            if (statusOrder[t.status] > statusOrder[existing.status]) {
              leadMap.set(t.leadId, t);
            }
          }
        }
      });

      const finalTasks = Array.from(leadMap.values()).sort((a, b) => 
        new Date(b.deadline || 0).getTime() - new Date(a.deadline || 0).getTime()
      );

      if (isRefresh || pageNum === 1) {
        setTasks(finalTasks);
      } else {
        setTasks(prev => {
          const combined = [...prev, ...finalTasks];
          const secondMap = new Map<string, Task>();
          combined.forEach(ct => {
             const ex = secondMap.get(ct.leadId);
             if (!ex || (ct.type === 'EDIT' && ex.type === 'SHOOT') || (ct.type === ex.type && statusOrder[ct.status] > statusOrder[ex.status])) {
               secondMap.set(ct.leadId, ct);
             }
          });
          return Array.from(secondMap.values());
        });
      }
      setLastPage(resData.meta?.lastPage || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isAdminOrManager, apiClient]);

  useEffect(() => {
    if (isAuthenticated) {
      setPage(1);
      fetchTasks(1);
    }
  }, [isAuthenticated, fetchTasks]);

  const loadMore = useCallback(() => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchTasks(next);
    }
  }, [page, lastPage, loading, fetchTasks]);

  const getStatusStyle = useCallback((status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: theme.success, bg: theme.success + '15' };
      case 'IN_PROGRESS': return { color: theme.warning, bg: theme.warning + '15' };
      default: return { color: theme.textDim, bg: theme.surfaceLight };
    }
  }, [theme]);

  const handleInitializeEdit = (leadId: string) => {
    router.push({
      pathname: '/(app)/manager/assign',
      params: { leadId, type: 'EDIT' }
    });
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.manager} />
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: Task }) => {
    const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'COMPLETED';
    const isToday = new Date(item.deadline).toDateString() === new Date().toDateString();
    const canAssignEdit = isAdminOrManager && item.type === 'SHOOT' && item.status === 'COMPLETED';
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={[styles.taskCard, isOverdue && styles.overdueCard]}>
        <TouchableOpacity 
          style={styles.cardMain}
          onPress={() => router.push(`/(app)/tasks/${item.id}`)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.typeTag}>
              <PlayCircle size={12} color={item.type === 'SHOOT' ? theme.videographer : theme.editor} />
              <Text style={[styles.typeTagText, { color: item.type === 'SHOOT' ? theme.videographer : theme.editor }]}>{item.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.clientName}>{item.lead?.name}</Text>
          <Text style={styles.businessName}>{item.lead?.business}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.metaInfo}>
              <Clock size={12} color={isOverdue ? theme.error : theme.textDark} />
              <Text style={[styles.metaText, isOverdue && { color: theme.error }]}>
                {new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            {isToday && <View style={styles.todayFlag}><Text style={styles.todayFlagText}>DUE TODAY</Text></View>}
          </View>
        </TouchableOpacity>

        {canAssignEdit ? (
          <TouchableOpacity 
            style={styles.actionSection}
            onPress={() => handleInitializeEdit(item.leadId)}
            activeOpacity={0.7}
          >
            <View style={styles.actionDivider} />
            <View style={styles.actionContent}>
              <View style={styles.actionIconBox}>
                <Edit3 size={16} color={theme.info} />
              </View>
              <Text style={styles.actionText}>INITIATE EDITING PHASE</Text>
              <ArrowRightCircle size={18} color={theme.info} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.chevron}
            onPress={() => router.push(`/(app)/tasks/${item.id}`)}
          >
            <ChevronRight size={20} color={theme.border} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>{isAdminOrManager ? 'Production Pipeline' : 'My Assignments'}</Text>
          <Text style={styles.pageSubtitle}>Monitor workflow status and progression</Text>
        </View>
        {isAdminOrManager && (
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => router.push('/(app)/manager/assign')}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(1, true)} tintColor={theme.manager} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {user?.role === 'VIDEOGRAPHER' ? 'No shoot tasks assigned.' : 
               user?.role === 'EDITOR' ? 'No edit tasks assigned.' : 
               'No active tasks in the pipeline.'}
            </Text>
          </View>
        }
        renderItem={renderTaskItem}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 20,
    backgroundColor: theme.background,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.textDim,
    marginTop: 2,
    fontWeight: '500',
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.videographer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.videographer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: { padding: Spacing.lg, paddingTop: 0 },
  taskCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  overdueCard: {
    borderColor: theme.error + '40',
    backgroundColor: theme.error + '05',
  },
  cardMain: {
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
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  businessName: {
    color: theme.textDim,
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
    color: theme.textDark,
    fontSize: 12,
    fontWeight: '600',
  },
  todayFlag: {
    backgroundColor: theme.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  todayFlagText: {
    color: theme.error,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionSection: {
    backgroundColor: theme.info + '10',
  },
  actionDivider: {
    height: 1,
    backgroundColor: theme.border,
    opacity: 0.5,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: theme.info + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    color: theme.info,
    letterSpacing: 1,
  },
  chevron: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
  },
  empty: { 
    paddingVertical: 120, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  emptyText: { 
    color: theme.textDark,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
});
