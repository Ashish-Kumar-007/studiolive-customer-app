import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Target, 
  ClipboardCheck, 
  Video, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  PlusCircle,
  FileText,
  LayoutDashboard,
  Calendar,
  ChevronRight,
  CircleDollarSign
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

interface DashboardStats {
  totalLeads?: number;
  pendingQualification?: number;
  activeTasks?: number;
  completedTasks?: number;
  totalEarned?: number;
  pipeline?: number;
  booked?: number;
  monthlyTarget?: number;
  currentProgress?: number;
}

export default function Dashboard() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, logout, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const role = user?.role;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
      
      let combinedStats: DashboardStats = {};

      // 1. Fetch general summary
      try {
        const sumRes = await apiClient.get('/reporting/summary');
        combinedStats = { ...combinedStats, ...sumRes.data };
      } catch (e) {
        console.warn('Global summary unavailable', e);
      }

      // 2. Fetch personal stats for staff roles
      if (!isAdminOrManager) {
        try {
          const meRes = await apiClient.get('/reporting/me/stats');
          combinedStats = { ...combinedStats, ...meRes.data };
        } catch (e) {
          console.warn('Personal stats unavailable', e);
        }
      }

      // 3. Fetch admin-only deep insights
      if (isAdminOrManager) {
        try {
          const [leaderRes, finRes] = await Promise.all([
            apiClient.get('/reporting/leaderboard'),
            apiClient.get('/reporting/finance').catch(() => ({ data: { earned: 0, pipeline: 0, booked: 0 } }))
          ]);
          setLeaderboard(leaderRes.data.slice(0, 3));
          combinedStats = {
            ...combinedStats,
            totalEarned: finRes.data.earned,
            pipeline: finRes.data.pipeline,
            booked: finRes.data.booked
          };
        } catch (e) {
          console.warn('Admin stats restricted', e);
        }
      }

      setStats(combinedStats);
    } catch (error: any) {
      console.error('Critical failure in dashboard fetch', error);
    } finally {
      setLoading(false);
    }
  }, [role, apiClient]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchDashboardData();
      }
    }, [isAuthenticated, fetchDashboardData])
  );

  const renderStatCard = useCallback((title: string, value: string | number, icon: any, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 18, color: color })}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  ), [styles]);

  const renderQuickAction = useCallback((title: string, icon: any, route: string, color: string) => (
    <TouchableOpacity 
      style={styles.actionButton} 
      onPress={() => router.push(route as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 22, color: color })}
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  ), [styles, router]);

  const roleSpecificContent = useMemo(() => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      return (
        <>
          {/* ── OPERATIONS PANEL — shown first, instant access ── */}
          <View style={styles.section}>
            <View style={styles.opsPanelHeader}>
              <View style={styles.opsBadge}>
                <View style={styles.opsBadgeDot} />
                <Text style={styles.opsBadgeText}>OPERATIONS</Text>
              </View>
              <Text style={styles.opsPanelTitle}>Command Center</Text>
            </View>

            <View style={styles.opsGrid}>
              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/team')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.admin + '20' }]}>
                  <Users size={22} color={theme.admin} />
                </View>
                <Text style={styles.opsCardLabel}>Team</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/leads')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.marketing + '20' }]}>
                  <FileText size={22} color={theme.marketing} />
                </View>
                <Text style={styles.opsCardLabel}>Leads</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/tasks')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.videographer + '20' }]}>
                  <Video size={22} color={theme.videographer} />
                </View>
                <Text style={styles.opsCardLabel}>Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/reporting')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.success + '20' }]}>
                  <TrendingUp size={22} color={theme.success} />
                </View>
                <Text style={styles.opsCardLabel}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/manager/assign')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.manager + '20' }]}>
                  <PlusCircle size={22} color={theme.manager} />
                </View>
                <Text style={styles.opsCardLabel}>Assign</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.opsCard} onPress={() => router.push('/(app)/manager/targets')} activeOpacity={0.85}>
                <View style={[styles.opsCardIcon, { backgroundColor: theme.warning + '20' }]}>
                  <Target size={22} color={theme.warning} />
                </View>
                <Text style={styles.opsCardLabel}>Targets</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── REVENUE INTELLIGENCE ── */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#020617', '#1E1B4B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.execHeroGradientCard}
            >
              <View style={styles.execHeroHeader}>
                <View style={styles.execTitleRow}>
                  <CircleDollarSign size={18} color={theme.success} style={{ marginRight: 8 }} />
                  <Text style={styles.execHeroTitleGradient}>Revenue Intelligence</Text>
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.mainRevenueContainer}>
                <Text style={styles.revenueMainValue}>₹{(stats.totalEarned || 0).toLocaleString()}</Text>
                <Text style={styles.revenueMainLabel}>REALIZED INCOME</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '65%', backgroundColor: theme.success }]} />
              </View>

              <View style={styles.revenueBreakdownGrid}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <View style={[styles.dot, { backgroundColor: theme.warning }]} />
                    <Text style={styles.breakdownLabel}>BOOKED</Text>
                  </View>
                  <Text style={styles.breakdownValue}>₹{(stats.booked || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <View style={[styles.dot, { backgroundColor: theme.info }]} />
                    <Text style={styles.breakdownLabel}>PIPELINE</Text>
                  </View>
                  <Text style={styles.breakdownValue}>₹{(stats.pipeline || 0).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.execHeroFooter}>
                <TrendingUp size={14} color={theme.success} />
                <Text style={styles.execFooterText}>18.4% growth from previous cycle</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── STRATEGIC PIPELINE ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategic Pipeline</Text>
            <View style={styles.execPipelineGrid}>
              <TouchableOpacity style={styles.premiumPipelineCard} onPress={() => router.push('/(app)/leads')}>
                <LinearGradient colors={[theme.marketing + '20', theme.marketing + '05']} style={styles.premiumCardIcon}>
                  <Users size={20} color={theme.marketing} />
                </LinearGradient>
                <View style={styles.premiumCardContent}>
                  <Text style={styles.premiumCardValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.premiumCardLabel}>Market Capture</Text>
                </View>
                <ChevronRight size={16} color={theme.border} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.premiumPipelineCard} onPress={() => router.push('/(app)/tasks')}>
                <LinearGradient colors={[theme.videographer + '20', theme.videographer + '05']} style={styles.premiumCardIcon}>
                  <Video size={20} color={theme.videographer} />
                </LinearGradient>
                <View style={styles.premiumCardContent}>
                  <Text style={styles.premiumCardValue}>{stats.activeTasks || 0}</Text>
                  <Text style={styles.premiumCardLabel}>Production Pipeline</Text>
                </View>
                <ChevronRight size={16} color={theme.border} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── PERFORMANCE ELITE ── */}
          {leaderboard.length > 0 && (
            <View style={styles.section}>
              <View style={styles.execLeaderboardHeader}>
                <Text style={styles.sectionTitle}>Performance Elite</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/reporting')}>
                  <Text style={styles.execViewAllLink}>Analytics</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.execLeaderboardCard}>
                {leaderboard.map((item, index) => (
                  <View key={item.id || index} style={[styles.execLeaderboardRow, index !== leaderboard.length - 1 && styles.execBorderBottom]}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                    <View style={styles.execStaffInfo}>
                      <Text style={styles.execStaffName}>{item.name}</Text>
                      <Text style={styles.execStaffRole}>Marketing Strategist</Text>
                    </View>
                    <Text style={styles.rankValue}>{item.leadsCount} pts</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      );
    }


    if (role === 'MARKETING') {
      return (
        <>
          <View style={styles.section}>
            <LinearGradient 
              colors={['#701A75', '#DB2777']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.execHeroGradientCard}
            >
              <View style={styles.execHeroHeader}>
                <Text style={styles.execHeroTitleGradient}>Monthly Target</Text>
                <View style={[styles.execGrowthBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Target size={12} color="#FBCFE8" />
                  <Text style={[styles.execGrowthText, { color: '#FBCFE8' }]}>IN PROGRESS</Text>
                </View>
              </View>
              <Text style={styles.execHeroValueGradient}>{stats.totalLeads || 0} / 50</Text>
              <Text style={styles.execHeroSubGradient}>Leads Captured This Month</Text>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conversion Funnel</Text>
            <View style={styles.execPipelineGrid}>
              <View style={[styles.execPipelineCard, { borderLeftColor: theme.marketing }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.marketing + '15' }]}>
                  <Users size={18} color={theme.marketing} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Captured</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: theme.warning }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.warning + '15' }]}>
                  <Clock size={18} color={theme.warning} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.pendingQualification || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Pending Qual.</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: theme.success }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.success + '15' }]}>
                  <CheckCircle2 size={18} color={theme.success} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.completedTasks || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Convinced</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Actions</Text>
            <View style={styles.actionsGrid}>
              {renderQuickAction('Add Lead', PlusCircle, '/(app)/marketing', theme.marketing)}
              {renderQuickAction('My Target', Target, '/(app)/target', theme.warning)}
            </View>
          </View>
        </>
      );
    }

    if (role === 'RECEPTIONIST') {
      return (
        <>
          <View style={styles.section}>
            <LinearGradient 
              colors={['#134E4A', '#0D9488']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.execHeroGradientCard}
            >
              <View style={styles.execHeroHeader}>
                <Text style={styles.execHeroTitleGradient}>Qualification Desk</Text>
                <View style={[styles.execGrowthBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Clock size={12} color="#FECACA" />
                  <Text style={[styles.execGrowthText, { color: '#FECACA' }]}>ACTION REQ.</Text>
                </View>
              </View>
              <Text style={styles.execHeroValueGradient}>{stats.pendingQualification || 0}</Text>
              <Text style={styles.execHeroSubGradient}>Leads Awaiting Your Qualification</Text>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pipeline Flow</Text>
            <View style={styles.execPipelineGrid}>
              <View style={[styles.execPipelineCard, { borderLeftColor: theme.receptionist }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.receptionist + '15' }]}>
                  <Users size={18} color={theme.receptionist} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.execPipelineLabel}>New Inquiries</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: theme.videographer }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.videographer + '15' }]}>
                  <Video size={18} color={theme.videographer} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.activeTasks || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Active Tasks</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: theme.success }]}>
                <View style={[styles.execIconCircle, { backgroundColor: theme.success + '15' }]}>
                  <CheckCircle2 size={18} color={theme.success} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.completedTasks || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Closed Deals</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qualify & Track</Text>
            <View style={styles.actionsGrid}>
              {renderQuickAction('Qualify Leads', ClipboardCheck, '/(app)/receptionist', theme.receptionist)}
              {renderQuickAction('All Leads', FileText, '/(app)/leads', theme.admin)}
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Status</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Assigned', stats.activeTasks || 0, Clock, theme.warning)}
            {renderStatCard('Completed', stats.completedTasks || 0, CheckCircle2, theme.success)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Center</Text>
          <View style={styles.actionsGrid}>
            {renderQuickAction(
              role === 'VIDEOGRAPHER' ? 'Shoot Tasks' : 'Edit Tasks', 
              role === 'VIDEOGRAPHER' ? Video : FileText, 
              '/(app)/tasks', 
              role === 'VIDEOGRAPHER' ? theme.videographer : theme.editor
            )}
            {renderQuickAction('Calendar', Calendar, '/(app)/tasks/calendar', theme.info)}
          </View>
        </View>
      </>
    );
  }, [role, stats, leaderboard, renderQuickAction, renderStatCard, theme]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor={theme.admin} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.roleText}>{user?.role} WORKSPACE</Text>
        </View>
        <View style={[styles.avatarSmall, { backgroundColor: theme.admin + '20' }]}>
          <Text style={[styles.avatarLetter, { color: theme.admin }]}>{user?.name?.[0]}</Text>
        </View>
      </View>

      <View style={styles.roleBanner}>
        <LayoutDashboard size={16} color={theme.admin} />
        <Text style={styles.roleBannerText}>
          {role === 'ADMIN' || role === 'MANAGER'
            ? 'You are viewing management insights and team controls.'
            : role === 'MARKETING'
            ? 'Focus on lead capture, follow-ups, and targets.'
            : role === 'RECEPTIONIST'
            ? 'Prioritize qualification and pipeline movement.'
            : 'Track tasks and delivery status for ongoing projects.'}
        </Text>
      </View>

      {roleSpecificContent}
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  roleText: {
    color: theme.textDark,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 4,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarLetter: {
    fontWeight: '800',
    fontSize: 18,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
    marginBottom: Spacing.md,
  },
  // ── Operations Panel ──
  opsPanelHeader: {
    marginBottom: Spacing.md,
  },
  opsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  opsBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.admin,
  },
  opsBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.admin,
    letterSpacing: 2,
  },
  opsPanelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.5,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  opsCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: theme.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  opsCardIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opsCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.3,
  },

  roleBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBannerText: {
    color: theme.textDim,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: theme.surface,
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statInfo: {
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: Radius.md,
  },
  statValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statTitle: {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
  },
  execHeroGradientCard: {
    borderRadius: Radius.xxxl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  execHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  execHeroTitleGradient: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  premiumPipelineCard: {
    backgroundColor: theme.surface,
    padding: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 4,
  },
  premiumCardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardContent: {
    flex: 1,
  },
  premiumCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
  },
  premiumCardLabel: {
    fontSize: 12,
    color: theme.textDim,
    fontWeight: '600',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.textDark,
    marginRight: 12,
    width: 30,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  execGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  execGrowthText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  execHeroValueGradient: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  execTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainRevenueContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  revenueMainValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.5,
  },
  revenueMainLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginTop: -4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  revenueBreakdownGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  breakdownDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  execHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  execFooterText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  execHeroSubGradient: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  execPipelineGrid: {
    gap: Spacing.md,
  },
  execPipelineCard: {
    backgroundColor: theme.surface,
    padding: Spacing.md,
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  execIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  execPipelineInfo: {
    flex: 1,
  },
  execPipelineValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  execPipelineLabel: {
    fontSize: 13,
    color: theme.textDim,
    fontWeight: '500',
    marginTop: 2,
  },
  execLeaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  execViewAllLink: {
    color: theme.admin,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  execLeaderboardCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  execLeaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.xxl,
  },
  execBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border + '50',
    borderRadius: 0,
  },
  execRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  execRankGold: {
    backgroundColor: '#F59E0B',
  },
  execRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.textDark,
  },
  execStaffInfo: {
    flex: 1,
  },
  execStaffName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  execStaffRole: {
    fontSize: 11,
    color: theme.textDim,
    fontWeight: '500',
  },
  execLeadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.admin + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  execLeadCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.admin,
  },
});
