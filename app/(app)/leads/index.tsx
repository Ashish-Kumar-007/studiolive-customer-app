import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/authStore';
import { useRouter } from 'expo-router';
import { Phone, ChevronRight, Clock, CheckCircle2, Archive, Search, Filter, Lock, Plus } from 'lucide-react-native';
import { maskPhone } from '../../../src/utils/masking';

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
  const theme = useTheme();
  const styles = createStyles(theme);
  const { isAuthenticated, user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const router = useRouter();

  const isMarketing = user?.role === 'MARKETING';

  const fetchLeads = useCallback(async (pageNum = 1, isRefresh = false) => {
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
  }, [isAuthenticated, apiClient]);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  const loadMore = useCallback(() => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchLeads(next);
    }
  }, [page, lastPage, loading, fetchLeads]);

  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
      case 'CONVINCED': return { icon: CheckCircle2, color: theme.success, bg: theme.success + '15' };
      case 'ARCHIVED': return { icon: Archive, color: theme.textDark, bg: theme.surfaceLight };
      default: return { icon: Clock, color: theme.warning, bg: theme.warning + '15' };
    }
  }, [theme]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.phone.includes(query)
    );
  }, [leads, searchQuery]);

  const renderItem = useCallback(({ item }: { item: Lead }) => {
    const config = getStatusConfig(item.status);
    const displayedPhone = isMarketing ? maskPhone(item.phone) : item.phone;

    return (
      <TouchableOpacity
        style={[styles.card, isMarketing && styles.cardDisabled]}
        onPress={() => !isMarketing && router.push(`/(app)/leads/${item.id}`)}
        activeOpacity={isMarketing ? 1 : 0.7}
      >
        <View style={[styles.cardAccent, { backgroundColor: theme.marketing + '40' }]} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: config.bg }]}>
              <Text style={[styles.avatarText, { color: config.color }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.cardMain}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.leadName} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                <config.icon size={10} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.leadSub} numberOfLines={1}>
              {item.business} • <Text style={{ color: theme.textDim }}>{item.source}</Text>
            </Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.phoneInfo}>
                <Phone size={12} color={theme.textDim} />
                <Text style={styles.phoneText}>{displayedPhone}</Text>
              </View>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.cardRight}>
            {isMarketing ? (
              <View style={styles.lockIcon}>
                <Lock size={16} color={theme.border} />
              </View>
            ) : (
              <ChevronRight color={theme.border} size={20} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [styles, theme, isMarketing, router, getStatusConfig]);

  return (
    <View style={styles.container}>
      {loading && leads.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.marketing} />
        </View>
      ) : (
        <>
          <LinearGradient
            colors={[theme.background, theme.surfaceLight]}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Leads Directory</Text>
                <Text style={styles.subtitle}>{leads.length} Total Potential Clients</Text>
              </View>
              {!isMarketing && (
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/leads/create')}>
                  <Plus size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <Search size={18} color={theme.textDim} />
                <TextInput
                  placeholder="Search by name or phone..."
                  placeholderTextColor={theme.textDark}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.filterBtn}>
                <Filter size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <FlatList
            data={filteredLeads}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeads(1, true)} tintColor={theme.marketing} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIconCircle}>
                  <Search size={40} color={theme.border} />
                </View>
                <Text style={styles.emptyText}>No matching leads found</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>Clear all filters</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={renderItem}
          />
        </>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.background 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.background 
  },
  header: {
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textDim,
    fontWeight: '600',
    marginTop: 2,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: theme.marketing,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.marketing,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: theme.surface,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: theme.text,
    fontSize: 15,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: Radius.xl,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  list: { 
    padding: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.95,
    backgroundColor: theme.surface + '80',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'center',
  },
  cardLeft: {
    marginRight: Spacing.md,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
  },
  cardMain: { 
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leadName: { 
    color: theme.text, 
    fontSize: 17, 
    fontWeight: '800',
    maxWidth: '65%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  statusText: { 
    fontSize: 9, 
    fontWeight: '900', 
    textTransform: 'uppercase',
  },
  leadSub: { 
    color: theme.text, 
    fontSize: 13,
    fontWeight: '600', 
    marginBottom: 10 
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  phoneText: { 
    color: theme.textDim, 
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    color: theme.textDark,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardRight: {
    paddingLeft: Spacing.sm,
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  empty: { 
    paddingVertical: 80, 
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyText: { 
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  clearSearch: {
    color: theme.marketing,
    fontWeight: '700',
    fontSize: 14,
  }
});
