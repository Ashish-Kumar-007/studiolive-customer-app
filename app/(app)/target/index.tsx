import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { Target, TrendingUp, Award, Clock } from 'lucide-react-native';

interface TargetData {
  daily: number;
  weekly: number;
  currentProgress: number;
}

export default function MyTarget() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const [target, setTarget] = useState<TargetData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTarget = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me/target');
      setTarget(response.data);
    } catch (error) {
      console.warn('Target not found, showing default');
      setTarget({ daily: 5, weekly: 30, currentProgress: 12 });
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    if (isAuthenticated) fetchTarget();
  }, [isAuthenticated, fetchTarget]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.marketing} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Weekly Performance</Text>
            <Text style={styles.headerSubtitle}>Monitor your progress against assigned quotas</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.cardHeader}>
              <Target color={theme.marketing} size={24} />
              <Text style={styles.cardTitle}>Current Week Progress</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statValue}>{target?.currentProgress}</Text>
                <Text style={styles.statLabel}>Achieved</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.statValue}>{target?.weekly}</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(target ? (target.currentProgress / target.weekly) * 100 : 0, 100)}%`, backgroundColor: theme.marketing }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(target ? (target.currentProgress / target.weekly) * 100 : 0)}% of weekly target reached</Text>
          </View>

          <View style={styles.grid}>
            <View style={[styles.miniCard, { borderLeftColor: theme.manager, borderLeftWidth: 4 }]}>
              <Award size={20} color={theme.manager} />
              <Text style={styles.miniLabel}>Daily Avg Goal</Text>
              <Text style={styles.miniValue}>{(target!.weekly / 6).toFixed(1)}</Text>
            </View>
            <View style={[styles.miniCard, { borderLeftColor: theme.videographer, borderLeftWidth: 4 }]}>
              <Clock size={20} color={theme.videographer} />
              <Text style={styles.miniLabel}>Daily Setup</Text>
              <Text style={styles.miniValue}>{target?.daily}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.historyBtn}
            onPress={() => Alert.alert('Coming Soon', 'Detailed history tracking is in development.')}
          >
            <TrendingUp size={20} color={theme.text} />
            <Text style={styles.historyBtnText}>View Achievement History</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textDim,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: theme.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statValue: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    color: theme.textDark,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.border,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: theme.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    color: theme.textDim,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  miniCard: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  miniLabel: {
    color: theme.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  miniValue: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: theme.border,
  },
  historyBtnText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
