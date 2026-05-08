import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { apiClient } from '../../../src/api/client';
import { Target, TrendingUp, Award, Clock } from 'lucide-react-native';

interface TargetData {
  daily: number;
  monthly: number;
  currentProgress: number;
}

export default function MyTarget() {
  const { user, isAuthenticated } = useAuthStore();
  const [target, setTarget] = useState<TargetData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTarget = async () => {
    try {
      const response = await apiClient.get('/users/me/target');
      setTarget(response.data);
    } catch (error) {
      console.warn('Target not found, showing default');
      setTarget({ daily: 5, monthly: 100, currentProgress: 2 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTarget();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.marketing} />
      </View>
    );
  }

  const progressPercent = target ? (target.currentProgress / target.daily) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Performance</Text>
        <Text style={styles.headerSubtitle}>Track your goals and achievements</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.cardHeader}>
          <Target color={Colors.marketing} size={24} />
          <Text style={styles.cardTitle}>Today's Progress</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>{target?.currentProgress}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.statValue}>{target?.daily}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: Colors.marketing }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progressPercent)}% of daily target reached</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.miniCard, { borderLeftColor: Colors.manager, borderLeftWidth: 4 }]}>
          <Award size={20} color={Colors.manager} />
          <Text style={styles.miniLabel}>Monthly Target</Text>
          <Text style={styles.miniValue}>{target?.monthly}</Text>
        </View>
        <View style={[styles.miniCard, { borderLeftColor: Colors.videographer, borderLeftWidth: 4 }]}>
          <Clock size={20} color={Colors.videographer} />
          <Text style={styles.miniLabel}>Avg/Day</Text>
          <Text style={styles.miniValue}>{(target!.monthly / 22).toFixed(1)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.historyBtn}
        onPress={() => Alert.alert('Coming Soon', 'Detailed history tracking is in development.')}
      >
        <TrendingUp size={20} color={Colors.text} />
        <Text style={styles.historyBtnText}>View Achievement History</Text>
      </TouchableOpacity>
    </ScrollView>
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
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
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
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statValue: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    color: Colors.textDim,
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
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniLabel: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  miniValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
