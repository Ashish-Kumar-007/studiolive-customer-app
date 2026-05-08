import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
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
  LogOut,
  FileText,
  LayoutDashboard,
  Calendar
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface DashboardStats {
  totalLeads?: number;
  pendingQualification?: number;
  activeTasks?: number;
  completedTasks?: number;
  totalEarned?: number;
  monthlyTarget?: number;
  currentProgress?: number;
}

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const role = user?.role;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
      const isMarketingOrRec = role === 'MARKETING' || role === 'RECEPTIONIST';
      
      let combinedStats: DashboardStats = {};

      // Only fetch business summary for management and front-office roles
      if (isAdminOrManager || isMarketingOrRec) {
        try {
          const sumRes = await apiClient.get('/reporting/summary');
          combinedStats = { ...combinedStats, ...sumRes.data };
        } catch (e) {
          console.warn('Reporting summary restricted or unavailable', e);
        }
      }

      if (isAdminOrManager) {
        try {
          const [leaderRes, finRes] = await Promise.all([
            apiClient.get('/reporting/leaderboard'),
            apiClient.get('/reporting/finance').catch(() => ({ data: { earned: 0 } }))
          ]);
          setLeaderboard(leaderRes.data.slice(0, 3));
          combinedStats.totalEarned = finRes.data.earned;
        } catch (e) {
          console.warn('Admin stats restricted or unavailable', e);
        }
      }

      setStats(combinedStats);
    } catch (error: any) {
      console.error('Critical failure in dashboard fetch', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboardData();
  }, [isAuthenticated]);

  const renderStatCard = (title: string, value: string | number, icon: any, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 18, color: color })}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderQuickAction = (title: string, icon: any, route: string, color: string) => (
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
  );

  const renderRoleSpecificContent = () => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      return (
        <>
          {/* Executive Hero KPI */}
          <View style={styles.section}>
            <LinearGradient 
              colors={['#1E1B4B', '#4338CA']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.execHeroGradientCard}
            >
              <View style={styles.execHeroHeader}>
                <Text style={styles.execHeroTitleGradient}>Total Revenue</Text>
                <View style={[styles.execGrowthBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <TrendingUp size={12} color="#A7F3D0" />
                  <Text style={[styles.execGrowthText, { color: '#A7F3D0' }]}>+14%</Text>
                </View>
              </View>
              <Text style={styles.execHeroValueGradient}>₹{(stats.totalEarned || 0).toLocaleString()}</Text>
              <Text style={styles.execHeroSubGradient}>Current Month Performance</Text>
            </LinearGradient>
          </View>

          {/* Operations Pipeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operations Pipeline</Text>
            <View style={styles.execPipelineGrid}>
              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.manager }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.manager + '15' }]}>
                  <Users size={18} color={Colors.manager} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Total Leads</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.receptionist }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.receptionist + '15' }]}>
                  <Clock size={18} color={Colors.receptionist} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.pendingQualification || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Pending Qual.</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.videographer }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.videographer + '15' }]}>
                  <Video size={18} color={Colors.videographer} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.activeTasks || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Active Tasks</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Elevated Leaderboard */}
          {leaderboard.length > 0 && (
            <View style={styles.section}>
              <View style={styles.execLeaderboardHeader}>
                <Text style={styles.sectionTitle}>Marketing Leaderboard</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/reporting')}>
                  <Text style={styles.execViewAllLink}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.execLeaderboardCard}>
                {leaderboard.map((item, index) => (
                  <View key={item.id || index} style={[styles.execLeaderboardRow, index !== leaderboard.length - 1 && styles.execBorderBottom]}>
                    <View style={[styles.execRankBadge, index === 0 && styles.execRankGold]}>
                      <Text style={[styles.execRankText, index === 0 && { color: '#fff' }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.execStaffInfo}>
                      <Text style={styles.execStaffName}>{item.name}</Text>
                      <Text style={styles.execStaffRole}>Marketing</Text>
                    </View>
                    <View style={styles.execLeadBadge}>
                      <Target size={12} color={Colors.admin} />
                      <Text style={styles.execLeadCountText}>{item.leadsCount}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Management Hub */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management Hub</Text>
            <View style={styles.actionsGrid}>
              {renderQuickAction('Team', Users, '/(app)/team', Colors.admin)}
              {renderQuickAction('Leads', FileText, '/(app)/leads', Colors.marketing)}
              {renderQuickAction('Assign', PlusCircle, '/(app)/manager/assign', Colors.manager)}
            </View>
          </View>
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
              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.marketing }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.marketing + '15' }]}>
                  <Users size={18} color={Colors.marketing} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Captured</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.warning }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.warning + '15' }]}>
                  <Clock size={18} color={Colors.warning} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.pendingQualification || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Pending Qual.</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.success }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.success + '15' }]}>
                  <CheckCircle2 size={18} color={Colors.success} />
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
              {renderQuickAction('Add Lead', PlusCircle, '/(app)/marketing', Colors.marketing)}
              {renderQuickAction('My Target', Target, '/(app)/target', Colors.warning)}
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
              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.receptionist }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.receptionist + '15' }]}>
                  <Users size={18} color={Colors.receptionist} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.totalLeads || 0}</Text>
                  <Text style={styles.execPipelineLabel}>New Inquiries</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.videographer }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.videographer + '15' }]}>
                  <Video size={18} color={Colors.videographer} />
                </View>
                <View style={styles.execPipelineInfo}>
                  <Text style={styles.execPipelineValue}>{stats.activeTasks || 0}</Text>
                  <Text style={styles.execPipelineLabel}>Active Tasks</Text>
                </View>
              </View>

              <View style={[styles.execPipelineCard, { borderLeftColor: Colors.success }]}>
                <View style={[styles.execIconCircle, { backgroundColor: Colors.success + '15' }]}>
                  <CheckCircle2 size={18} color={Colors.success} />
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
              {renderQuickAction('Qualify Leads', ClipboardCheck, '/(app)/receptionist', Colors.receptionist)}
              {renderQuickAction('All Leads', FileText, '/(app)/leads', Colors.admin)}
            </View>
          </View>
        </>
      );
    }

    // Videographers & Editors
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Status</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Assigned', stats.activeTasks || 0, Clock, Colors.warning)}
            {renderStatCard('Completed', stats.completedTasks || 0, CheckCircle2, Colors.success)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Center</Text>
          <View style={styles.actionsGrid}>
            {renderQuickAction('My Tasks', ClipboardCheck, '/(app)/tasks', Colors.videographer)}
            {renderQuickAction('Calendar', Calendar, '/(app)/tasks/calendar', Colors.info)}
          </View>
        </View>
      </>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor={Colors.admin} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
          <Text style={styles.roleText}>{user?.role} WORKSPACE</Text>
        </View>
        <View style={[styles.avatarSmall, { backgroundColor: Colors.admin + '20' }]}>
          <Text style={styles.avatarLetter}>{user?.name?.[0]}</Text>
        </View>
      </View>

      <View style={styles.roleBanner}>
        <LayoutDashboard size={16} color={Colors.admin} />
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

      {renderRoleSpecificContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  roleText: {
    color: Colors.textDark,
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
    borderColor: Colors.border,
  },
  avatarLetter: {
    color: Colors.admin,
    fontWeight: '800',
    fontSize: 18,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
    marginBottom: Spacing.md,
  },
  roleBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBannerText: {
    color: Colors.textDim,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statTitle: {
    color: Colors.textDim,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  leaderboardCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.xl,
    marginBottom: 4,
  },
  topRank: {
    backgroundColor: Colors.admin,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  staffName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  leadCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countText: {
    color: Colors.textDark,
    fontSize: 11,
    fontWeight: '800',
  },
  viewAllBtn: {
    paddingVertical: 12,
    marginTop: 4,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewAllLink: {
    color: Colors.admin,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  execHeroSubGradient: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  execPipelineGrid: {
    gap: Spacing.md,
  },
  execPipelineCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  execPipelineLabel: {
    fontSize: 13,
    color: Colors.textDim,
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
    color: Colors.admin,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  execLeaderboardCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxxl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderBottomColor: Colors.border + '50',
    borderRadius: 0,
  },
  execRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
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
    color: Colors.textDark,
  },
  execStaffInfo: {
    flex: 1,
  },
  execStaffName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  execStaffRole: {
    fontSize: 11,
    color: Colors.textDim,
    fontWeight: '500',
  },
  execLeadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.admin + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  execLeadCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.admin,
  },
});
