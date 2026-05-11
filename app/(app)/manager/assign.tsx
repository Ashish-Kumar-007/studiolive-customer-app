import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { Input } from '../../../src/components/Input';
import { AppModal } from '../../../src/components/AppModal';
import { apiClient } from '../../../src/api/client';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { 
  Users, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
} from 'lucide-react-native';
import Button from '../../../src/components/AppButton';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface Lead {
  id: string;
  name: string;
  business: string;
  status: string;
  tasks?: any[];
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

export default function AssignTask() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'SHOOT' | 'EDIT' | 'TARGET' | 'GENERAL'>('SHOOT');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    type: 'SHOOT' as any,
    leadId: '',
    assignedId: '',
    deadline: '',
    details: '',
    count: '', // For targets
    period: 'WEEKLY' as 'WEEKLY' | 'MONTHLY' // For targets
  });
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, usersRes] = await Promise.all([
        apiClient.get('/leads'),
        apiClient.get('/users')
      ]);
      const leadsArray = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.data || [];
      const usersArray = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];

      setLeads(leadsArray);
      setUsers(usersArray);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    setForm(prev => ({ ...prev, type: activeTab, leadId: '', assignedId: '' }));
  }, [activeTab]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = selectedDate.toISOString().split('T')[0];
      setForm({ ...form, deadline: formatted });
    }
  };

  const handleSubmit = useCallback(async () => {
    if (activeTab === 'TARGET') {
      if (!form.assignedId || !form.count) {
        Alert.alert('Required Fields', 'Please select a marketing user and enter a target count.');
        return;
      }
    } else if (activeTab === 'GENERAL') {
      if (!form.assignedId || !form.deadline || !form.details) {
        Alert.alert('Required Fields', 'Please select a staff member, deadline, and provide instructions.');
        return;
      }
    } else {
      if (!form.leadId || !form.assignedId || !form.deadline) {
        Alert.alert('Required Fields', 'Please select a lead, staff member, and deadline.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (activeTab === 'TARGET') {
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

        const endpoint = form.period === 'WEEKLY' ? '/targets/weekly' : '/targets/monthly';
        const payload = form.period === 'WEEKLY' 
          ? { marketingId: form.assignedId, count: parseInt(form.count), weekNumber: weekNo, year: now.getFullYear() }
          : { marketingId: form.assignedId, count: parseInt(form.count), month: now.getMonth() + 1, year: now.getFullYear() };

        await apiClient.post(endpoint, payload);
      } else {
        await apiClient.post('/tasks', {
          type: form.type,
          leadId: form.leadId || undefined,
          assignedId: form.assignedId,
          deadline: form.deadline,
          details: form.details
        });
      }
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign protocol');
    } finally {
      setSubmitting(false);
    }
  }, [activeTab, form, apiClient]);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (activeTab === 'SHOOT') filtered = users.filter(u => u.role === 'VIDEOGRAPHER');
    else if (activeTab === 'EDIT') filtered = users.filter(u => u.role === 'EDITOR');
    else if (activeTab === 'TARGET') filtered = users.filter(u => u.role === 'MARKETING');
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [users, activeTab, searchQuery]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;
    if (activeTab === 'SHOOT') {
      filtered = leads.filter(l => l.status === 'CONVINCED');
    } else if (activeTab === 'EDIT') {
      filtered = leads.filter(l => l.tasks?.some(t => t.type === 'SHOOT' && t.status === 'COMPLETED'));
    } else {
      return [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => l.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [leads, activeTab, searchQuery]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.manager} />
      </View>
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You are not authorized to assign tasks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Unified Assignment</Text>
            <Text style={styles.subtitle}>Delegate tasks or assign targets to your team</Text>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            {(['SHOOT', 'EDIT', 'TARGET', 'GENERAL'] as const).map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lead Selection (for Shoot/Edit) */}
          {(activeTab === 'SHOOT' || activeTab === 'EDIT') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Select Client Protocol</Text>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search clients..."
                  placeholderTextColor={theme.textDark}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <View style={styles.verticalList}>
                {filteredLeads.map(lead => (
                  <TouchableOpacity 
                    key={lead.id} 
                    style={[styles.listCard, form.leadId === lead.id && styles.activeListCard]}
                    onPress={() => setForm({ ...form, leadId: lead.id })}
                  >
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle}>{lead.name}</Text>
                      <Text style={styles.cardSub}>{lead.business || 'No Business'}</Text>
                    </View>
                    {form.leadId === lead.id && <CheckCircle2 size={20} color={theme.manager} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Target Period (for Target) */}
          {activeTab === 'TARGET' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Define Target Period</Text>
              <View style={styles.periodGrid}>
                {(['WEEKLY', 'MONTHLY'] as const).map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.periodCard, form.period === p && styles.activePeriodCard]}
                    onPress={() => setForm({ ...form, period: p })}
                  >
                    <Text style={[styles.periodText, form.period === p && styles.activePeriodText]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input
                label="Target Lead Count"
                placeholder="e.g. 20"
                keyboardType="numeric"
                value={form.count}
                onChangeText={(text) => setForm({ ...form, count: text })}
              />
            </View>
          )}

          {/* Staff Selection (Universal) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'TARGET' ? '2. Assign to Marketing' : (activeTab === 'GENERAL' ? '1. Select Staff' : '2. Assign to Expert')}
            </Text>
            {activeTab === 'GENERAL' && (
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search staff members..."
                  placeholderTextColor={theme.textDark}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}
            <View style={styles.verticalList}>
              {filteredUsers.map(u => (
                <TouchableOpacity 
                  key={u.id} 
                  style={[styles.listCard, form.assignedId === u.id && styles.activeListCard]}
                  onPress={() => setForm({ ...form, assignedId: u.id })}
                >
                  <View style={styles.cardMain}>
                    <Text style={styles.cardTitle}>{u.name}</Text>
                    <Text style={styles.cardSub}>{u.role}</Text>
                  </View>
                  {form.assignedId === u.id && <CheckCircle2 size={20} color={theme.manager} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Task Details & Deadline (for non-Target) */}
          {activeTab !== 'TARGET' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{activeTab === 'GENERAL' ? '2. Task Particulars' : '3. Completion Protocol'}</Text>
              
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={theme.manager} />
                <Text style={styles.dateText}>{form.deadline || 'Select Deadline'}</Text>
              </TouchableOpacity>

              <Input
                label="Instructions / Details"
                placeholder="Specific requirements for this task..."
                multiline
                numberOfLines={3}
                value={form.details}
                onChangeText={(text) => setForm({ ...form, details: text })}
              />
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Button
            title="Initialize Protocol"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>

        <AppModal
          visible={showSuccess}
          onClose={() => { setShowSuccess(false); router.replace('/(app)'); }}
          title="Protocol Initiated"
          variant="center"
          accentColor={theme.success}
          scrollable={false}
          footer={
            <Button
              title="Acknowledge"
              onPress={() => { setShowSuccess(false); router.replace('/(app)'); }}
              style={{ flex: 1, backgroundColor: theme.success }}
            />
          }
        >
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <CheckCircle2 size={56} color={theme.success} />
            <Text style={[styles.modalDesc, { marginTop: 16 }]}>The assignment has been successfully integrated and the team member notified.</Text>
          </View>
        </AppModal>
      </KeyboardAvoidingView>
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
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textDim,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: theme.textDim,
    textAlign: 'center',
    marginTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 4,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.lg,
  },
  activeTab: {
    backgroundColor: theme.manager,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textDim,
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  searchBox: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    height: 48,
    color: theme.text,
    fontSize: 15,
  },
  verticalList: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border + '50',
  },
  activeListCard: {
    backgroundColor: theme.manager + '10',
  },
  cardMain: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  cardSub: {
    fontSize: 12,
    color: theme.textDim,
    marginTop: 2,
  },
  periodGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  periodCard: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: theme.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  activePeriodCard: {
    borderColor: theme.manager,
    backgroundColor: theme.manager + '05',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.textDim,
  },
  activePeriodText: {
    color: theme.manager,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: Spacing.md,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.lg,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: theme.manager,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 9, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 16,
    color: theme.textDim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
