import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radius, Spacing } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Play, 
  Calendar as CalendarIcon, 
  FileText, 
  ChevronLeft,
  Briefcase,
  User,
  Video
} from 'lucide-react-native';

type TaskData = {
  id: string;
  type: 'SHOOT' | 'EDIT';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  details?: string;
  deadline?: string;
  updatedAt: string;
  lead: {
    id: string;
    name: string;
    phone: string;
    business?: string;
    notes?: string;
    tasks: Array<{
      type: 'SHOOT' | 'EDIT';
      status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
      updatedAt: string;
    }>;
  };
};

export default function TaskDetailsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastUpdatedStatus, setLastUpdatedStatus] = useState('');
  const router = useRouter();

  const fetchTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load task details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/tasks/${id}/status`, { status: newStatus });
      setTask(prev => prev ? { ...prev, status: newStatus as any, updatedAt: new Date().toISOString() } : null);
      setLastUpdatedStatus(newStatus);
      setShowSuccess(true);
      fetchTask(); // Refresh to get the latest lead tasks
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
    if (task?.lead?.phone) {
      Linking.openURL(`tel:${task.lead.phone}`);
    }
  };

  const accentColor = task?.type === 'SHOOT' ? theme.videographer : theme.info;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.videographer} />
        </View>
      ) : !task ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Task not found.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Hero */}
          <LinearGradient
            colors={[task.type === 'SHOOT' ? theme.videographer : theme.info, (task.type === 'SHOOT' ? theme.videographer : theme.info) + 'DD']}
            style={styles.hero}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            
            <View style={styles.heroContent}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{task.type} SESSION</Text>
              </View>
              <Text style={styles.heroTitle}>{task.lead?.name}</Text>
              <View style={styles.statusRow}>
                <Clock size={16} color="#fff" style={{ opacity: 0.8 }} />
                <Text style={styles.statusValue}>{task.status.replace('_', ' ')}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {/* Production Timeline Section */}
            <Text style={styles.sectionTitle}>Production Pipeline</Text>
            <View style={styles.card}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: task.lead?.tasks?.find(t => t.type === 'SHOOT')?.status === 'COMPLETED' ? theme.success + '20' : theme.surfaceLight }]}>
                  <Video size={16} color={task.lead?.tasks?.find(t => t.type === 'SHOOT')?.status === 'COMPLETED' ? theme.success : theme.textDark} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Production Shoot</Text>
                  <Text style={[styles.timelineStatus, { color: task.lead?.tasks?.find(t => t.type === 'SHOOT')?.status === 'COMPLETED' ? theme.success : theme.warning }]}>
                    {task.lead?.tasks?.find(t => t.type === 'SHOOT')?.status || 'NOT STARTED'}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: task.lead?.tasks?.find(t => t.type === 'EDIT')?.status === 'COMPLETED' ? theme.success + '20' : theme.surfaceLight }]}>
                  <FileText size={16} color={task.lead?.tasks?.find(t => t.type === 'EDIT')?.status === 'COMPLETED' ? theme.success : theme.textDark} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Post-Production Edit</Text>
                  <Text style={[styles.timelineStatus, { color: task.lead?.tasks?.find(t => t.type === 'EDIT')?.status === 'COMPLETED' ? theme.success : theme.warning }]}>
                    {task.lead?.tasks?.find(t => t.type === 'EDIT')?.status || 'AWAITING SHOOT'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Client Details Section */}
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Briefcase size={18} color={task.type === 'SHOOT' ? theme.videographer : theme.info} />
                </View>
                <View style={styles.infoMain}>
                  <Text style={styles.infoLabel}>Business</Text>
                  <Text style={styles.infoValue}>{task.lead?.business || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Phone size={18} color={task.type === 'SHOOT' ? theme.videographer : theme.info} />
                </View>
                <View style={styles.infoMain}>
                  <Text style={styles.infoLabel}>Contact Number</Text>
                  <Text style={styles.infoValue}>{task.lead?.phone}</Text>
                </View>
                <TouchableOpacity style={[styles.callBtn, { backgroundColor: task.type === 'SHOOT' ? theme.videographer : theme.info }]} onPress={handleCall}>
                  <Phone size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Task Particulars Section */}
            <Text style={styles.sectionTitle}>Task Details</Text>
            <View style={styles.card}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <CalendarIcon size={18} color={theme.textDim} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.infoLabel}>Deadline</Text>
                    <Text style={styles.infoValue}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />

              <View style={styles.notesBox}>
                <View style={styles.notesHeader}>
                  <FileText size={16} color={theme.textDim} />
                  <Text style={styles.notesTitle}>Instructions</Text>
                </View>
                <Text style={styles.notesText}>
                  {task.details || 'No additional instructions provided for this task.'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {task.status === 'ASSIGNED' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: task.type === 'SHOOT' ? theme.videographer : theme.info }]} 
                  onPress={() => updateStatus('IN_PROGRESS')}
                  disabled={updating}
                >
                  {updating ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Play size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Start Work</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {task.status === 'IN_PROGRESS' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.success }]} 
                  onPress={() => updateStatus('COMPLETED')}
                  disabled={updating}
                >
                  {updating ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <CheckCircle2 size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Mark Completed</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {task.status === 'COMPLETED' && (
                <View style={styles.completedBadge}>
                  <CheckCircle2 size={24} color={theme.success} />
                  <Text style={styles.completedText}>Task Finalized</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalGlow} />
            <View style={[styles.modalIconContainer, { backgroundColor: accentColor + '20' }]}>
              <CheckCircle2 size={40} color={accentColor} />
            </View>
            <Text style={styles.modalTitle}>Protocol Updated</Text>
            <Text style={styles.modalDesc}>
              The task is now marked as <Text style={{ color: accentColor, fontWeight: '800' }}>{lastUpdatedStatus.replace('_', ' ')}</Text>. Your dashboard is being synchronized.
            </Text>
            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: accentColor }]} 
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalBtnText}>Acknowledge</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: Radius.xxxl,
    borderBottomRightRadius: Radius.xxxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroContent: {
    marginBottom: Spacing.lg,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  statusValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    padding: Spacing.lg,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.textDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoMain: {
    flex: 1,
  },
  infoLabel: {
    color: theme.textDim,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: Spacing.md,
    opacity: 0.5,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesBox: {
    backgroundColor: theme.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textDark,
  },
  notesText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  timelineStatus: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 11,
    color: theme.textDim,
    marginTop: 4,
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: theme.border,
    marginLeft: 17,
    marginVertical: -8,
    opacity: 0.5,
  },
  actions: {
    marginTop: Spacing.xl,
  },
  actionBtn: {
    height: 56,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: Spacing.lg,
    backgroundColor: theme.success + '10',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.success + '30',
  },
  completedText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.success,
    letterSpacing: 0.5,
  },
  emptyText: {
    color: theme.textDim,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 9, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    opacity: 0.5,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  modalDesc: {
    fontSize: 15,
    color: theme.textDim,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  modalBtn: {
    width: '100%',
    height: 56,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
