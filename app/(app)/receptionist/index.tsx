import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { Phone, ChevronRight, X, CheckCircle2 } from 'lucide-react-native';

interface Lead {
  id: string;
  name: string;
  business: string;
  phone: string;
  source: string;
  status: 'NEW' | 'CONVINCED' | 'ARCHIVED';
  amount?: number;
}

export default function ReceptionistLeads() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [amount, setAmount] = useState('');
  const [qualifying, setQualifying] = useState(false);

  const fetchLeads = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);

    try {
      const response = await apiClient.get('/leads', { params: { page: pageNum, limit: 10 } });
      const resData = response.data;

      if (resData?.data && resData?.meta) {
        const newLeads = resData.data.filter((l: any) => l.status === 'NEW');
        
        if (isRefresh || pageNum === 1) {
          setLeads(newLeads);
        } else {
          setLeads(prev => [...prev, ...newLeads]);
        }
        setLastPage(resData.meta.lastPage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiClient]);

  useEffect(() => {
    if (isAuthenticated) fetchLeads(1);
  }, [isAuthenticated, fetchLeads]);

  const loadMore = useCallback(() => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchLeads(next);
    }
  }, [page, lastPage, loading, fetchLeads]);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleQualify = useCallback(async (status: 'CONVINCED' | 'ARCHIVED') => {
    if (!selectedLead) return;

    if (status === 'CONVINCED' && !amount) {
      Alert.alert('Required', 'Please enter the logged amount for this lead.');
      return;
    }

    setQualifying(true);
    try {
      await apiClient.patch(`/leads/${selectedLead.id}/qualify`, {
        status,
        amount: status === 'CONVINCED' ? Number(amount) : 0
      });
      
      setSelectedLead(null);
      setAmount('');
      fetchLeads(1, true);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update lead');
    } finally {
      setQualifying(false);
    }
  }, [selectedLead, amount, fetchLeads, apiClient]);

  const renderItem = useCallback(({ item }: { item: Lead }) => (
    <TouchableOpacity 
      style={styles.leadCard} 
      onPress={() => setSelectedLead(item)}
      activeOpacity={0.8}
    >
      <View style={styles.leadInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.leadName}>{item.name}</Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        </View>
        <Text style={styles.leadSub}>{item.business} • {item.source}</Text>
        <View style={styles.phoneRow}>
          <Phone size={14} color={theme.textDim} />
          <Text style={styles.leadPhone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.chevronBg}>
        <ChevronRight color={theme.receptionist} size={20} />
      </View>
    </TouchableOpacity>
  ), [styles, theme, setSelectedLead]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.receptionist} />
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchLeads(1, true)} tintColor={theme.receptionist} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>New Inquiries</Text>
              <Text style={styles.headerSubtitle}>Qualify or archive recently submitted leads</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>All caught up! No pending leads.</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      <Modal
        visible={!!selectedLead}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Qualify Lead</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLead(null)}>
                <X color={theme.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Client Name</Text>
                <Text style={styles.detailValue}>{selectedLead?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Business Type</Text>
                <Text style={styles.detailValue}>{selectedLead?.business}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{selectedLead?.phone}</Text>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Input
                label="Final Agreed Amount (INR)"
                placeholder="e.g. 50000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.modalActions}>
              <Button 
                title="Mark Convinced" 
                onPress={() => handleQualify('CONVINCED')}
                loading={qualifying}
                style={{ backgroundColor: theme.receptionist, width: '100%', marginBottom: 12 }}
                textStyle={{ color: '#fff' }}
              />
              <Button 
                title="Archive Lead" 
                variant="ghost" 
                onPress={() => handleQualify('ARCHIVED')}
                style={{ width: '100%' }}
                textStyle={{ color: theme.textDim }}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={48} color={theme.success} />
            </View>
            <Text style={styles.successTitle}>Lead Qualified</Text>
            <Text style={styles.successDesc}>The lead has been successfully moved to convinced status and the production team has been notified.</Text>
            <Button 
              title="Great!" 
              onPress={() => setShowSuccess(false)}
              style={{ width: '100%', backgroundColor: theme.success }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textDim,
    marginTop: 4,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  leadCard: {
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  leadInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  leadName: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: theme.receptionist + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  newBadgeText: {
    color: theme.receptionist,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leadSub: {
    color: theme.textDim,
    fontSize: 14,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leadPhone: {
    color: theme.textDark,
    fontSize: 13,
    fontWeight: '500',
  },
  chevronBg: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: theme.receptionist + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.textDark,
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  detailCard: {
    backgroundColor: theme.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: theme.textDark,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 9, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successModalContent: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 16,
    color: theme.textDim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
