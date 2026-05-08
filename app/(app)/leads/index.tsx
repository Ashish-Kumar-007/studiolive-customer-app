import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { Phone, ChevronRight, Clock, CheckCircle2, Archive, Search } from 'lucide-react-native';

interface Lead {
  id: string;
  name: string;
  phone: string;
  business: string;
  source: string;
  status: 'NEW' | 'CONVINCED' | 'ARCHIVED';
  createdAt: string;
}

export default function LeadsDirectory() {
  const { isAuthenticated, user } = useAuthStore();
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
      const res = await apiClient.get('/leads', { params: { page: pageNum, limit: 15 } });
      const resData = res.data;
      
      if (resData?.data && resData?.meta) {
        if (isRefresh || pageNum === 1) {
          setLeads(resData.data);
        } else {
          setLeads(prev => [...prev, ...resData.data]);
        }
        setLastPage(resData.meta.lastPage);
      } else if (Array.isArray(resData)) {
        setLeads(resData);
        setLastPage(1);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONVINCED': return { icon: CheckCircle2, color: Colors.success, bg: Colors.success + '15' };
      case 'ARCHIVED': return { icon: Archive, color: Colors.textDark, bg: Colors.surfaceLight };
      default: return { icon: Clock, color: Colors.warning, bg: Colors.warning + '15' };
    }
  };

  if (loading && leads.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.marketing} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leads Directory</Text>
        <Text style={styles.subtitle}>Manage and track all customer inquiries</Text>
      </View>

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeads(1, true)} tintColor={Colors.marketing} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No leads found in the system.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = getStatusConfig(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/leads/${item.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatarCircle, { backgroundColor: config.bg }]}>
                  <Text style={[styles.avatarText, { color: config.color }]}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.cardMain}>
                <View style={styles.cardHeader}>
                  <Text style={styles.leadName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                    <config.icon size={12} color={config.color} />
                    <Text style={[styles.statusText, { color: config.color }]}>{item.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.leadSub}>{item.business} • {item.source}</Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.phoneBadge}>
                    <Phone size={12} color={Colors.textDark} />
                    <Text style={styles.phoneText}>{item.phone}</Text>
                  </View>
                  <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.chevronBg}>
                <ChevronRight color={Colors.border} size={20} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background 
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarContainer: {
    paddingLeft: Spacing.lg,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardMain: { 
    flex: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leadName: { 
    color: Colors.text, 
    fontSize: 18, 
    fontWeight: '800' 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  leadSub: { 
    color: Colors.textDark, 
    fontSize: 13,
    fontWeight: '500', 
    marginBottom: 12 
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    backgroundColor: Colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneText: { 
    color: Colors.textDark, 
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chevronBg: {
    paddingRight: Spacing.lg,
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
    opacity: 0.7,
  },
});
