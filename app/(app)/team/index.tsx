import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { RoleBadge } from '../../../src/components/RoleBadge';
import { UserPlus, X, Phone, Mail, Trash2, Target, BadgeCheck, Users } from 'lucide-react-native';
import { UserRole, useAuthStore } from '../../../src/store/authStore';
import { useConfirm } from '../../../src/components/ConfirmModal';
import { useSuccess } from '../../../src/components/SuccessModal';

interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  emailVerified?: boolean;
  isFirstLogin?: boolean;
}

const ROLES: UserRole[] = ['MANAGER', 'MARKETING', 'RECEPTIONIST', 'VIDEOGRAPHER', 'EDITOR'];

import { Select } from '../../../src/components/Select';

const TeamManagement = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, isAuthenticated } = useAuthStore();
  const { showConfirm, ConfirmDialog } = useConfirm();
  const { showSuccess, SuccessDialog } = useSuccess();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'MARKETING' as UserRole,
    phone: '',
  });

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Member | null>(null);
  const [targetCount, setTargetCount] = useState('');
  const [targetNotes, setTargetNotes] = useState('');
  const [settingTarget, setSettingTarget] = useState(false);

  const ROLE_OPTIONS = [
    { label: 'Admin', value: 'ADMIN', color: theme.admin },
    { label: 'Manager', value: 'MANAGER', color: theme.manager },
    { label: 'Marketing', value: 'MARKETING', color: theme.marketing },
    { label: 'Receptionist', value: 'RECEPTIONIST', color: theme.receptionist },
    { label: 'Videographer', value: 'VIDEOGRAPHER', color: theme.videographer },
    { label: 'Editor', value: 'EDITOR', color: theme.editor },
  ];

  const fetchMembers = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);

    try {
      const response = await apiClient.get('/users', { params: { page: pageNum, limit: 10 } });
      const resData = response.data;

      if (resData?.data && resData?.meta) {
        if (isRefresh || pageNum === 1) {
          setMembers(resData.data);
        } else {
          setMembers(prev => [...prev, ...resData.data]);
        }
        setLastPage(resData.meta.lastPage);
      } else if (Array.isArray(resData)) {
        setMembers(resData);
        setLastPage(1);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiClient]);

  useEffect(() => {
    if (isAuthenticated) fetchMembers(1);
  }, [isAuthenticated, fetchMembers]);

  const loadMore = useCallback(() => {
    if (page < lastPage && !loading) {
      const next = page + 1;
      setPage(next);
      fetchMembers(next);
    }
  }, [page, lastPage, loading, fetchMembers]);

  const handleSetTarget = useCallback(async () => {
    if (!selectedStaff || !targetCount) return;
    setSettingTarget(true);
    try {
      await apiClient.post(`/users/${selectedStaff.id}/target`, {
        count: Number(targetCount),
        notes: targetNotes,
      });
      Alert.alert('Success', `Target set for ${selectedStaff.name}`);
      setShowTargetForm(false);
      setSelectedStaff(null);
      setTargetCount('');
      setTargetNotes('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to set target');
    } finally {
      setSettingTarget(false);
    }
  }, [selectedStaff, targetCount, targetNotes, apiClient]);

  const handleDelete = useCallback(async (member: Member) => {
    if (user?.role === 'MANAGER' && (member.role === 'ADMIN' || member.role === 'MANAGER')) {
      Alert.alert('Permission Denied', 'Managers can only remove staff members.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Remove Member',
      message: `Remove ${member.name} from the team? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Keep',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await apiClient.delete(`/users/${member.id}`);
        fetchMembers(1, true);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
      }
    }
  }, [user?.role, fetchMembers, showConfirm]);

  const handleRegister = useCallback(async () => {
    if (!form.name || !form.email || !form.phone) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/users/register', form);
      setShowForm(false);
      setForm({ name: '', email: '', role: 'MARKETING', phone: '' });
      fetchMembers(1, true);
      showSuccess({
        title: 'Member Registered!',
        message: `${form.name} has been added to the team.`,
        detail: form.email,
        buttonText: 'Perfect',
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register member');
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchMembers, showSuccess]);

  const AVATAR_COLORS = [
    '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', 
    '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16', '#6366F1'
  ];

  const getAvatarColor = useCallback((name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }, []);

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

  return (
    <View style={styles.container}>
      {user?.role !== 'ADMIN' && user?.role !== 'MANAGER' ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You are not authorized to access team management.</Text>
        </View>
      ) : (
        <>
          {/* Premium Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Team Core</Text>
              <Text style={styles.subtitle}>Directory & Access Management</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)} activeOpacity={0.8}>
              <UserPlus color="#fff" size={18} />
              <Text style={styles.addButtonText}>Add Staff</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMembers(1, true)} tintColor={theme.admin} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={() => !loading ? (
              <View style={styles.emptyState}>
                <Users size={48} color={theme.border} />
                <Text style={styles.emptyText}>No team members found</Text>
              </View>
            ) : (
              <ActivityIndicator color={theme.admin} style={{ marginTop: 40 }} />
            )}
            renderItem={({ item }) => {
              const accentColor = getAvatarColor(item.name);
              return (
                <TouchableOpacity style={styles.memberCard} activeOpacity={0.9}>
                  <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.cardMain}>
                    <View style={styles.memberHeader}>
                      <View style={styles.memberMainInfo}>
                        <View style={[styles.avatarCircle, { backgroundColor: accentColor + '15' }]}>
                          <Text style={[styles.avatarText, { color: accentColor }]}>{getInitials(item.name)}</Text>
                        </View>
                        <View style={styles.nameSection}>
                          <View style={styles.nameRow}>
                            <Text style={styles.memberName}>{item.name}</Text>
                            {item.emailVerified && !item.isFirstLogin && (
                              <BadgeCheck size={14} color={theme.admin} />
                            )}
                          </View>
                          <RoleBadge role={item.role as any} />
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {item.role === 'MARKETING' && (
                          <TouchableOpacity 
                            onPress={() => { setSelectedStaff(item); setShowTargetForm(true); }}
                            style={styles.actionBtn}
                          >
                            <Target size={16} color={theme.marketing} />
                          </TouchableOpacity>
                        )}
                        {item.id !== user?.id && !(user?.role === 'MANAGER' && item.role === 'ADMIN') && (
                          <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn, styles.deleteBtn]}>
                            <Trash2 size={16} color={theme.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.memberDetails}>
                      <View style={styles.detailRow}>
                        <Mail size={12} color={theme.textDark} />
                        <Text style={styles.detailText}>{item.email}</Text>
                      </View>
                      {item.phone && (
                        <View style={styles.detailRow}>
                          <Phone size={12} color={theme.textDark} />
                          <Text style={styles.detailText}>{item.phone}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {/* Target Modal */}
      <Modal visible={showTargetForm} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Set Target</Text>
                <Text style={styles.modalSubtitle}>For {selectedStaff?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTargetForm(false)} style={styles.closeBtn}>
                <X color={theme.text} size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Input label="Lead Quota" placeholder="e.g. 10" keyboardType="numeric" value={targetCount} onChangeText={setTargetCount} />
              <Input label="Notes" placeholder="Special instructions..." value={targetNotes} onChangeText={setTargetNotes} multiline />
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="outline" onPress={() => setShowTargetForm(false)} style={{ flex: 1 }} />
              <View style={{ width: 12 }} />
              <Button title="Set Target" onPress={handleSetTarget} loading={settingTarget} style={{ flex: 2, backgroundColor: theme.marketing }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Register Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.registerModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Member</Text>
                <Text style={styles.modalSubtitle}>Create a new staff account</Text>
              </View>
              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn}>
                <X color={theme.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Input label="Full Name" placeholder="John Doe" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
              <Input label="Email Address" placeholder="john@studiolive.com" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} autoCapitalize="none" keyboardType="email-address" />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />

              <Select
                label="Assign Role"
                value={form.role}
                options={ROLE_OPTIONS.filter(o => 
                  user?.role === 'ADMIN' || o.value !== 'ADMIN'
                )}
                onSelect={(val) => setForm({ ...form, role: val as UserRole })}
              />
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={submitting}
                style={{ flex: 1, backgroundColor: theme.admin, height: 56, borderRadius: Radius.full }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <ConfirmDialog />
      <SuccessDialog />
    </View>
  );
};

export default TeamManagement;

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.textDim,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.admin,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    shadowColor: theme.admin,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  memberCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAccent: {
    width: 4,
    height: '100%',
  },
  cardMain: {
    flex: 1,
    padding: Spacing.lg,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  memberMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  memberName: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  memberDetails: {
    marginTop: 4,
    paddingLeft: 66,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    color: theme.textDark,
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    borderColor: theme.error + '30',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: 16,
  },
  emptyText: {
    color: theme.textDark,
    fontSize: 15,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    maxHeight: '90%',
  },
  registerModal: {
    backgroundColor: theme.background,
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.textDim,
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: theme.surface,
    borderRadius: 20,
  },
  modalBody: {
    padding: Spacing.xl,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
});
