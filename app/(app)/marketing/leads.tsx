import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { Phone, ChevronRight, Clock, CheckCircle2, Archive } from 'lucide-react-native';

interface Lead {
  id: string;
  name: string;
  phone: string;
  business: string;
  source: string;
  status: 'NEW' | 'CONVINCED' | 'ARCHIVED';
  createdAt: string;
}

export default function MyLeadsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { isAuthenticated } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const router = useRouter();

  const fetchLeads = async (pageNum = 1, isRefresh = false) => {
    if (!isAuthenticated) return;
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);

    try {
      // Backend auto-filters by marketingId for this role
      const res = await apiClient.get('/leads', { params: { page: pageNum, limit: 10 } });

      const resData = res.data;
      if (resData?.data && resData?.meta) {
        if (isRefresh || pageNum === 1) {
          setLeads(resData.data);
        } else {
          setLeads(prev => [...prev, ...resData.data]);
        }
        setLastPage(resData.meta.lastPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [isAuthenticated]);

  const loadMore = () => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchLeads(next);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONVINCED': return <CheckCircle2 size={16} color={theme.success} />;
      case 'ARCHIVED': return <Archive size={16} color={theme.textDark} />;
      default: return <Clock size={16} color={theme.warning} />;
    }
  };

  if (loading && leads.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.marketing} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeads(1, true)} tintColor={theme.marketing} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>You haven't added any leads yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/leads/${item.id}`)}
          >
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.leadName}>{item.name}</Text>
                <View style={styles.statusRow}>
                  {getStatusIcon(item.status)}
                  <Text style={[styles.statusText, { color: item.status === 'CONVINCED' ? theme.success : (item.status === 'ARCHIVED' ? theme.textDark : theme.warning) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.leadSub}>{item.business} • {item.source}</Text>
              <View style={styles.phoneRow}>
                <Phone size={12} color={theme.textDark} />
                <Text style={styles.phoneText}>{item.phone}</Text>
              </View>
            </View>
            <ChevronRight color={theme.border} size={20} />
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leadName: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  leadSub: { color: theme.textDim, fontSize: 12, marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phoneText: { color: theme.textDark, fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: theme.textDark },
});
