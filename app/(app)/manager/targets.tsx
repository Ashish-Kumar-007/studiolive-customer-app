import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { Target, Users, TrendingUp, Save, X, ChevronRight, Award } from 'lucide-react-native';
import Button from '../../../src/components/AppButton';
import { useAlert } from '../../../src/components/AlertModal';
import { useSuccess } from '../../../src/components/SuccessModal';

interface MarketingStaff {
  id: string;
  name: string;
  email: string;
  weeklyTargets: Array<{ count: number }>;
  monthlyTargets: Array<{ count: number }>;
  _count: { leadsCreated: number };
}

export default function TargetManagement() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { showAlert, AlertDialog } = useAlert();
  const { showSuccess, SuccessDialog } = useSuccess();
  const [staff, setStaff] = useState<MarketingStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MarketingStaff | null>(null);
  const [targetCount, setTargetCount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const fetchStaff = async () => {
    try {
      const res = await apiClient.get('/targets/marketing-staff');
      setStaff(res.data);
    } catch (err) {
      showAlert({ title: 'Error', message: 'Could not fetch marketing staff data', variant: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !targetCount) return;
    
    const count = parseInt(targetCount);
    if (isNaN(count) || count <= 0) {
      showAlert({ title: 'Invalid Input', message: 'Please enter a valid positive number.', variant: 'warning' });
      return;
    }

    setUpdating(true);
    try {
      const now = new Date();
      if (period === 'WEEKLY') {
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

        await apiClient.post('/targets/weekly', {
          marketingId: selectedUser.id,
          count: count,
          weekNumber: weekNo,
          year: now.getFullYear()
        });
      } else {
        await apiClient.post('/targets/monthly', {
          marketingId: selectedUser.id,
          count: count,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        });
      }
      
      showSuccess({ title: 'Target Assigned!', message: `${period} target has been set successfully.`, detail: selectedUser.name });
      setTargetCount('');
      setSelectedUser(null);
      setSelectedUser(null);
      fetchStaff();
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to assign target', variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const renderStaffItem = ({ item }: { item: MarketingStaff }) => {
    const currentTarget = period === 'WEEKLY' 
      ? item.weeklyTargets[0]?.count || 0 
      : item.monthlyTargets[0]?.count || 0;
    
    // Note: progress calculation would need backend support for filtered counts 
    // for this UI to be fully accurate for month vs week. 
    // For now we show the current week progress.
    const progress = item._count.leadsCreated; 
    const percentage = currentTarget > 0 ? (progress / currentTarget) * 100 : 0;

    return (
      <TouchableOpacity 
        style={styles.staffCard} 
        onPress={() => {
          setSelectedUser(item);
          setTargetCount(currentTarget.toString());
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.marketing + '15' }]}>
            <Text style={[styles.avatarText, { color: theme.marketing }]}>{item.name[0]}</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffEmail}>{item.email}</Text>
          </View>
          <ChevronRight size={20} color={theme.border} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{period} Target</Text>
            <Text style={styles.statValue}>{currentTarget || 'Not Set'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Week Progress</Text>
            <Text style={styles.statValue}>{progress}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statStatus, { color: percentage >= 100 ? theme.success : theme.warning }]}>
              {percentage >= 100 ? 'Goal Reached' : 'In Progress'}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: theme.marketing }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Performance Quotas</Text>
            <Text style={styles.subtitle}>Set marketing goals for the pipeline</Text>
          </View>
        </View>

        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodBtn, period === 'WEEKLY' && styles.periodBtnActive]}
            onPress={() => setPeriod('WEEKLY')}
          >
            <Text style={[styles.periodBtnText, period === 'WEEKLY' && styles.periodBtnTextActive]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodBtn, period === 'MONTHLY' && styles.periodBtnActive]}
            onPress={() => setPeriod('MONTHLY')}
          >
            <Text style={[styles.periodBtnText, period === 'MONTHLY' && styles.periodBtnTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={staff}
        renderItem={renderStaffItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchStaff();
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Users size={48} color={theme.border} />
              <Text style={styles.emptyText}>No marketing staff found</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Set {period} Target</Text>
                <Text style={styles.modalSubtitle}>For {selectedUser?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <X size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Award size={20} color={theme.marketing} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={`Enter ${period.toLowerCase()} lead goal`}
                placeholderTextColor={theme.textDark}
                keyboardType="numeric"
                value={targetCount}
                onChangeText={setTargetCount}
                autoFocus
              />
            </View>

            <Text style={styles.inputHelp}>
              {period === 'WEEKLY' 
                ? 'Weekly targets reset every Monday at 00:00.' 
                : 'Monthly targets are for the current calendar month.'}
            </Text>

            <View style={styles.modalFooter}>
              <Button 
                title="Cancel" 
                variant="outline" 
                style={{ flex: 1 }} 
                onPress={() => setSelectedUser(null)} 
              />
              <Button 
                title="Assign Target" 
                style={{ flex: 2, backgroundColor: theme.marketing }} 
                onPress={handleAssign}
                loading={updating}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.marketing} />
        </View>
      )}
      <AlertDialog />
      <SuccessDialog />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  pageHeader: {
    padding: Spacing.xl,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.lg,
  },
  periodBtnActive: {
    backgroundColor: theme.marketing,
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textDim,
  },
  periodBtnTextActive: {
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textDim,
    marginTop: 4,
    fontWeight: '500',
  },
  list: { padding: Spacing.lg, paddingTop: 0 },
  staffCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '800' },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 18, fontWeight: '800', color: theme.text },
  staffEmail: { fontSize: 12, color: theme.textDim, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: theme.textDark, fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '800', color: theme.text, marginTop: 4 },
  statStatus: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  statDivider: { width: 1, height: 20, backgroundColor: theme.border, alignSelf: 'center' },
  progressContainer: {
    height: 6,
    backgroundColor: theme.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: Radius.full },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: 22, fontWeight: '900', color: theme.text },
  modalSubtitle: { fontSize: 14, color: theme.textDim, marginTop: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: 56,
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  inputHelp: {
    fontSize: 12,
    color: theme.textDark,
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { color: theme.textDim, marginTop: 12, fontSize: 15, fontWeight: '600' },
});
