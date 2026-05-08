import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { Phone, ChevronRight, X } from 'lucide-react-native';

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
  const { user, isAuthenticated } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [amount, setAmount] = useState('');
  const [qualifying, setQualifying] = useState(false);

  const fetchLeads = async (pageNum = 1, isRefresh = false) => {
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
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLeads(1);
  }, [isAuthenticated]);

  const loadMore = () => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchLeads(next);
    }
  };

  const handleQualify = async (status: 'CONVINCED' | 'ARCHIVED') => {
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
      Alert.alert('Success', `Lead marked as ${status}`);
      setSelectedLead(null);
      setAmount('');
      fetchLeads(1, true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update lead');
    } finally {
      setQualifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.receptionist} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchLeads(1, true)} tintColor={Colors.receptionist} />}
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
        renderItem={({ item }) => (
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
                <Phone size={14} color={Colors.textDim} />
                <Text style={styles.leadPhone}>{item.phone}</Text>
              </View>
            </View>
            <View style={styles.chevronBg}>
              <ChevronRight color={Colors.receptionist} size={20} />
            </View>
          </TouchableOpacity>
        )}
      />

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
                <X color={Colors.text} size={24} />
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
                title="Archive" 
                variant="outline" 
                onPress={() => handleQualify('ARCHIVED')}
                style={{ flex: 1 }}
              />
              <Button 
                title="Mark Convinced" 
                onPress={() => handleQualify('CONVINCED')}
                loading={qualifying}
                style={{ flex: 2, backgroundColor: Colors.receptionist }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 4,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  leadCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: Colors.receptionist + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  newBadgeText: {
    color: Colors.receptionist,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leadSub: {
    color: Colors.textDim,
    fontSize: 14,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leadPhone: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '500',
  },
  chevronBg: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.receptionist + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
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
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  detailCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: Colors.textDark,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
