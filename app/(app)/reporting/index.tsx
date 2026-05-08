import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react-native';

interface FinanceData {
  earned: number;
  pipeline: number;
  totalPotential: number;
}

interface StaffPerformance {
  name: string;
  leads: number;
  conversions: number;
}

export default function Reporting() {
  const { user, isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<any>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    try {
      const [sumRes, leadRes] = await Promise.all([
        apiClient.get('/reporting/summary'),
        isAdminOrManager ? apiClient.get('/reporting/leaderboard') : Promise.resolve({ data: [] })
      ]);
      
      setSummary(sumRes.data);
      setLeaderboard(leadRes.data);

      if (isAdminOrManager) {
        try {
          const finRes = await apiClient.get('/reporting/finance');
          setFinance(finRes.data);
        } catch (e) {}
      }
    } catch (error: any) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchReports();
  }, [isAuthenticated]);

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return (
      <View style={styles.deniedState}>
        <Text style={styles.deniedTitle}>Access Restricted</Text>
        <Text style={styles.deniedText}>Reporting is available only for Admin and Manager roles.</Text>
      </View>
    );
  }

  const viewStaffStats = async (id: string) => {
    if (selectedStaffId === id) {
      setSelectedStaffId(null);
      setStaffStats(null);
      return;
    }
    setSelectedStaffId(id);
    try {
      const res = await apiClient.get(`/reporting/staff/${id}/stats`);
      setStaffStats(res.data);
    } catch (_) {}
  };

  const renderFinanceCard = () => {
    if (!finance) return null;
    const earnedPercent = (finance.earned / (finance.totalPotential || 1)) * 100;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CircleDollarSign color={Colors.success} size={24} />
          <Text style={styles.cardTitle}>Financial Pipeline</Text>
        </View>
        
        <View style={styles.revenueGrid}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Earned</Text>
            <Text style={[styles.revenueValue, { color: Colors.success }]}>₹{finance.earned.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Pipeline</Text>
            <Text style={[styles.revenueValue, { color: Colors.warning }]}>₹{finance.pipeline.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${earnedPercent}%`, backgroundColor: Colors.success }]} />
          </View>
          <Text style={styles.progressLabel}>
            {earnedPercent.toFixed(0)}% of total potential revenue (₹{finance.totalPotential.toLocaleString()}) secured.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} />}
    >
      <View style={styles.padding}>
        {summary && (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.totalLeads || 0}</Text>
              <Text style={styles.summaryLabel}>Total Leads</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.completedTasks || 0}</Text>
              <Text style={styles.summaryLabel}>Tasks Done</Text>
            </View>
          </View>
        )}

        {renderFinanceCard()}

        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <>
            <View style={styles.sectionHeader}>
              <BarChart3 color={Colors.text} size={20} />
              <Text style={styles.sectionTitle}>Marketing Leaderboard</Text>
            </View>

            {leaderboard.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No data available yet.</Text>
              </View>
            ) : (
              leaderboard.map((staff, index) => (
                <View key={staff.id || index}>
                  <TouchableOpacity 
                    style={[styles.staffCard, selectedStaffId === staff.id && styles.staffCardActive]}
                    onPress={() => viewStaffStats(staff.id)}
                  >
                    <View style={styles.staffRank}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{staff.name}</Text>
                      <Text style={styles.staffStatText}>{staff.leadsCount} Total Leads</Text>
                    </View>
                    <View style={styles.staffRate}>
                      <Text style={styles.rateValue}>{staff.conversionRate}%</Text>
                      <Text style={styles.rateLabel}>Rate</Text>
                    </View>
                  </TouchableOpacity>

                  {selectedStaffId === staff.id && staffStats && (
                    <View style={styles.staffDetailCard}>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailVal}>{staffStats.convincedLeads}</Text>
                          <Text style={styles.detailLab}>Convinced</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailVal}>{staffStats.archivedLeads}</Text>
                          <Text style={styles.detailLab}>Archived</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={[styles.detailVal, { color: Colors.success }]}>₹{staffStats.revenueGenerated?.toLocaleString() || 0}</Text>
                          <Text style={styles.detailLab}>Revenue</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  padding: {
    padding: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: Colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  revenueGrid: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  revenueItem: {
    flex: 1,
  },
  revenueLabel: {
    color: Colors.textDim,
    fontSize: 12,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalPotential: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potentialLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  potentialValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: Colors.textDim,
    fontSize: 12,
  },
  progressPercent: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  staffCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  staffCardActive: {
    borderColor: Colors.admin,
    backgroundColor: Colors.admin + '08',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  staffRank: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: Colors.admin,
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffInfo: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  staffName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  staffStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staffStatText: {
    color: Colors.textDim,
    fontSize: 12,
  },
  staffStatDivider: {
    color: Colors.textDark,
  },
  staffRate: {
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  rateValue: {
    color: Colors.manager,
    fontSize: 20,
    fontWeight: 'bold',
  },
  rateLabel: {
    color: Colors.textDim,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  staffDetailCard: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.admin,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailVal: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailLab: {
    color: Colors.textDark,
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xxl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: Colors.textDark,
    fontSize: 14,
  },
  deniedState: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  deniedTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  deniedText: {
    color: Colors.textDim,
    textAlign: 'center',
  },
});
