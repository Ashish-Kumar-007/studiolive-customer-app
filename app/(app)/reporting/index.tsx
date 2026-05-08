import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { 
  CircleDollarSign, 
  Trophy,
  Activity,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Target,
  Gem
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FinanceData {
  earned: number;
  pipeline: number;
  booked: number;
  totalPotential: number;
}

export default function Reporting() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<any>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    try {
      const [sumRes, leadRes, finRes] = await Promise.all([
        apiClient.get('/reporting/summary'),
        isAdminOrManager ? apiClient.get('/reporting/leaderboard') : Promise.resolve({ data: [] }),
        isAdminOrManager ? apiClient.get('/reporting/finance') : Promise.resolve({ data: null })
      ]);
      
      setSummary(sumRes.data);
      setLeaderboard(leadRes.data);
      setFinance(finRes.data);
    } catch (error: any) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, apiClient]);

  useEffect(() => {
    if (isAuthenticated) fetchReports();
  }, [isAuthenticated, fetchReports]);

  const viewStaffStats = useCallback(async (id: string) => {
    if (selectedStaffId === id) {
      setSelectedStaffId(null);
      setStaffStats(null);
      return;
    }
    setSelectedStaffId(id);
    setStaffLoading(true);
    try {
      const res = await apiClient.get(`/reporting/staff/${id}/stats`);
      setStaffStats(res.data);
    } catch (_) {
    } finally {
      setStaffLoading(false);
    }
  }, [selectedStaffId, apiClient]);

  const renderFinancialPulse = () => {
    if (!finance) return null;
    const total = finance.totalPotential || 1;
    const earnedPct = (finance.earned / total) * 100;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Revenue Command Center</Text>
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>TOTAL POTENTIAL VALUE</Text>
              <Text style={styles.heroValue}>₹{finance.totalPotential.toLocaleString()}</Text>
            </View>
            <View style={styles.heroIconCircle}>
              <Gem size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.financeMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>BOOKED</Text>
              <Text style={styles.metricValue}>₹{finance.booked.toLocaleString()}</Text>
              <View style={[styles.metricDot, { backgroundColor: theme.warning }]} />
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PIPELINE</Text>
              <Text style={styles.metricValue}>₹{finance.pipeline.toLocaleString()}</Text>
              <View style={[styles.metricDot, { backgroundColor: theme.info }]} />
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>EARNED</Text>
              <Text style={[styles.metricValue, { color: theme.success }]}>₹{finance.earned.toLocaleString()}</Text>
              <View style={[styles.metricDot, { backgroundColor: theme.success }]} />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressTrackLabels}>
              <Text style={styles.trackText}>Secured Revenue</Text>
              <Text style={styles.trackPct}>{earnedPct.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${earnedPct}%` }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderFunnel = () => {
    if (!summary) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Conversion Funnel</Text>
        <View style={styles.funnelCard}>
          <View style={styles.funnelRow}>
            <View style={[styles.funnelBar, { width: '100%', backgroundColor: theme.marketing + '20' }]}>
              <Text style={[styles.funnelText, { color: theme.text }]}>{summary.totalLeads} Total Sourced</Text>
            </View>
            <ArrowRight size={14} color={theme.textDim} />
          </View>
          <View style={styles.funnelRow}>
            <View style={[styles.funnelBar, { width: '80%', backgroundColor: theme.warning + '20' }]}>
              <Text style={[styles.funnelText, { color: theme.text }]}>{summary.pendingQualification} Pending Qual.</Text>
            </View>
            <ArrowRight size={14} color={theme.textDim} />
          </View>
          <View style={styles.funnelRow}>
            <View style={[styles.funnelBar, { width: '60%', backgroundColor: theme.success + '20' }]}>
              <Text style={[styles.funnelText, { color: theme.success }]}>{summary.completedTasks} Completed Projects</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} tintColor={theme.admin} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Operations Intelligence</Text>
          <Text style={styles.headerSub}>Enterprise Performance Tracking</Text>
        </View>

        {!isAuthorized ? (
          <View style={styles.deniedState}>
            <LinearGradient colors={[theme.error + '20', theme.background]} style={styles.deniedBg}>
              <Target size={48} color={theme.error} />
              <Text style={styles.deniedTitle}>Admin Access Required</Text>
              <Text style={styles.deniedText}>The reporting suite is reserved for organizational leads and managers.</Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            {renderFinancialPulse()}
            {renderFunnel()}

            <View style={styles.section}>
              <View style={styles.staffHeader}>
                <Text style={styles.sectionHeading}>Elite Performers</Text>
                <Trophy size={18} color="#F59E0B" />
              </View>

              {leaderboard.map((staff, index) => (
                <View key={staff.id} style={styles.staffItem}>
                  <TouchableOpacity 
                    onPress={() => viewStaffStats(staff.id)}
                    activeOpacity={0.7}
                    style={[styles.staffCore, selectedStaffId === staff.id && styles.staffCoreActive]}
                  >
                    <View style={[styles.staffRank, index === 0 && styles.staffRankGold]}>
                      <Text style={[styles.staffRankText, index === 0 && { color: '#fff' }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{staff.name}</Text>
                      <View style={styles.staffBadges}>
                        <View style={styles.miniBadge}>
                          <Text style={styles.miniBadgeText}>{staff.leadsCount} LEADS</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.staffAction}>
                      <Text style={styles.staffActionValue}>{staff.conversions}</Text>
                      <Text style={styles.staffActionLabel}>WINS</Text>
                    </View>
                    <ChevronRight size={16} color={theme.border} />
                  </TouchableOpacity>

                  {selectedStaffId === staff.id && (
                    <View style={styles.staffDropdown}>
                      {staffLoading ? (
                        <ActivityIndicator size="small" color={theme.admin} />
                      ) : staffStats && (
                        <View style={styles.dropdownGrid}>
                          <View style={styles.dropdownBox}>
                            <Activity size={16} color={theme.admin} />
                            <Text style={styles.dropdownValue}>{staffStats.totalLeads}</Text>
                            <Text style={styles.dropdownLabel}>Capture</Text>
                          </View>
                          <View style={styles.dropdownBox}>
                            <TrendingUp size={16} color={theme.success} />
                            <Text style={styles.dropdownValue}>
                              {((staffStats.conversions / (staffStats.totalLeads || 1)) * 100).toFixed(0)}%
                            </Text>
                            <Text style={styles.dropdownLabel}>Success Rate</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 60,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 14,
    color: theme.textDim,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  heroCard: {
    borderRadius: Radius.xxxl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  financeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.md,
    borderRadius: Radius.xxl,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  metricDot: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  progressTrack: {
    marginTop: Spacing.sm,
  },
  progressTrackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trackText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  trackPct: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '800',
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.success,
  },
  funnelCard: {
    backgroundColor: theme.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  funnelBar: {
    padding: 12,
    borderRadius: Radius.lg,
  },
  funnelText: {
    fontSize: 12,
    fontWeight: '800',
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingRight: 8,
  },
  staffItem: {
    marginBottom: Spacing.sm,
  },
  staffCore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  staffCoreActive: {
    borderColor: theme.admin,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  staffRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffRankGold: {
    backgroundColor: '#F59E0B',
  },
  staffRankText: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.textDark,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  staffBadges: {
    flexDirection: 'row',
    marginTop: 2,
  },
  miniBadge: {
    backgroundColor: theme.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textDim,
  },
  staffAction: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  staffActionValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.admin,
  },
  staffActionLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.textDim,
    textTransform: 'uppercase',
  },
  staffDropdown: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.admin,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    padding: Spacing.md,
  },
  dropdownGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dropdownBox: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    gap: 4,
  },
  dropdownValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.text,
  },
  dropdownLabel: {
    fontSize: 9,
    color: theme.textDim,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deniedState: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
    backgroundColor: theme.background,
  },
  deniedBg: {
    padding: Spacing.xxl,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.error + '20',
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  deniedText: {
    fontSize: 16,
    color: theme.textDim,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 24,
  }
});
