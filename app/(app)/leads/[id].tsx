import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { Phone, Mail, Calendar, User, Briefcase, MapPin, ChevronLeft, Trash2 } from 'lucide-react-native';
import { maskPhone, maskEmail } from '../../../src/utils/masking';
import Button from '../../../src/components/AppButton';
import { useAuthStore } from '../../../src/store/authStore';

export default function LeadDetails() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isMarketing = user?.role === 'MARKETING';

  const fetchLeadDetails = async () => {
    try {
      const res = await apiClient.get(`/leads/${id}`);
      setLead(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch lead details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.marketing} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lead Details</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{lead?.name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{lead?.name}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: (lead?.status === 'CONVINCED' ? theme.success : lead?.status === 'NEW' ? theme.warning : theme.info) + '15' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: lead?.status === 'CONVINCED' ? theme.success : lead?.status === 'NEW' ? theme.warning : theme.info }
          ]}>
            {lead?.status}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Phone size={18} color={theme.textDim} />
            <Text style={styles.infoValue}>
              {isMarketing ? maskPhone(lead?.phone) : lead?.phone}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Mail size={18} color={theme.textDim} />
            <Text style={styles.infoValue}>
              {lead?.email 
                ? (isMarketing ? maskEmail(lead.email) : lead.email) 
                : 'No email provided'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Business Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={18} color={theme.textDim} />
            <View>
              <Text style={styles.infoLabel}>Business Type</Text>
              <Text style={styles.infoValue}>{lead?.business}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Calendar size={18} color={theme.textDim} />
            <View>
              <Text style={styles.infoLabel}>Created At</Text>
              <Text style={styles.infoValue}>{new Date(lead?.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {lead?.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{lead.notes}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.actions}>
        {(lead?.status === 'NEW' && (user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN' || user?.role === 'MANAGER')) ? (
          <Button
            title="Qualify This Lead"
            onPress={() => router.push('/receptionist')}
            style={{ backgroundColor: theme.receptionist }}
          />
        ) : (
          <Button
            title="Back to Leads"
            variant="outline"
            onPress={() => router.push('/leads')}
          />
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backBtn: {
    padding: 8,
    backgroundColor: theme.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
  },
  profileCard: {
    backgroundColor: theme.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.marketing + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.marketing,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: Spacing.lg,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: theme.textDim,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  notesText: {
    color: theme.text,
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    marginTop: Spacing.xxl,
  },
});
