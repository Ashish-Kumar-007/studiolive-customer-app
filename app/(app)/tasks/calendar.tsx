import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme, Radius, Spacing } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Clock, ChevronRight, PlayCircle } from 'lucide-react-native';

type CalendarTask = {
  id: string;
  type: 'SHOOT' | 'EDIT';
  status: string;
  deadline: string;
  lead: { name: string; business: string };
};

export default function TaskCalendarScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/tasks/calendar');
      const sortedTasks = (response.data || []).sort((a: any, b: any) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
      setTasks(sortedTasks);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.success;
      case 'IN_PROGRESS': return theme.warning;
      default: return theme.videographer;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.videographer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Production Schedule</Text>
        <Text style={styles.subtitle}>Your upcoming shoots and editing deadlines</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCalendar} tintColor={theme.videographer} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <CalendarIcon size={48} color={theme.border} />
            <Text style={styles.emptyText}>No scheduled tasks found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const date = new Date(item.deadline);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <TouchableOpacity 
              style={[styles.card, isToday && styles.todayCard]}
              onPress={() => router.push(`/(app)/tasks/${item.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{date.getDate()}</Text>
                <Text style={styles.dateMonth}>{date.toLocaleString('default', { month: 'short' })}</Text>
                {isToday && <View style={styles.todayBadge}><Text style={styles.todayText}>NOW</Text></View>}
              </View>

              <View style={styles.mainInfo}>
                <View style={styles.typeRow}>
                  <PlayCircle size={14} color={item.type === 'SHOOT' ? theme.videographer : theme.editor} />
                  <Text style={[styles.typeText, { color: item.type === 'SHOOT' ? theme.videographer : theme.editor }]}>{item.type}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                </View>

                <Text style={styles.clientName} numberOfLines={1}>{item.lead?.name || 'Unknown Client'}</Text>
                <Text style={styles.businessName} numberOfLines={1}>{item.lead?.business || 'Unspecified'}</Text>

                <View style={styles.timeRow}>
                  <Clock size={12} color={theme.textDark} />
                  <Text style={styles.timeText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>

              <ChevronRight size={20} color={theme.border} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  header: { padding: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.textDim, marginTop: 4 },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  todayCard: { borderColor: theme.videographer + '50', backgroundColor: theme.videographer + '05' },
  dateCol: { width: 60, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: theme.border, marginRight: Spacing.md, paddingVertical: 8 },
  dateDay: { fontSize: 26, fontWeight: '900', color: theme.text },
  dateMonth: { fontSize: 11, fontWeight: '800', color: theme.textDim, textTransform: 'uppercase' },
  todayBadge: { backgroundColor: theme.videographer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  todayText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  mainInfo: { flex: 1, paddingVertical: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
  clientName: { fontSize: 18, fontWeight: '800', color: theme.text },
  businessName: { fontSize: 13, color: theme.textDim, marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 12, fontWeight: '600', color: theme.textDark },
  empty: { alignItems: 'center', paddingTop: 100, gap: 16 },
  emptyText: { color: theme.textDark, fontSize: 15, fontWeight: '600' },
});
