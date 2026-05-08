import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';
import { Phone, Mail, Calendar, User, Business, MapPin, ChevronLeft, Trash2 } from 'lucide-react-native';
import Button from '../../../src/components/AppButton';
import { useAuthStore } from '../../../src/store/authStore';

export default function LeadDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        <ActivityIndicator size="large" color={Colors.marketing} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lead Details</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{lead?.name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{lead?.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: Colors.warning + '15' }]}>
          <Text style={[styles.statusText, { color: Colors.warning }]}>{lead?.status}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.textDim} />
            <Text style={styles.infoValue}>{lead?.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.textDim} />
            <Text style={styles.infoValue}>{lead?.email || 'No email provided'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Business Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User size={18} color={Colors.textDim} />
            <View>
              <Text style={styles.infoLabel}>Business Type</Text>
              <Text style={styles.infoValue}>{lead?.business}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Calendar size={18} color={Colors.textDim} />
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
        {(user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN' || user?.role === 'MANAGER') ? (
          <Button
            title="Qualify This Lead"
            onPress={() => router.push('/receptionist')}
            style={{ backgroundColor: Colors.receptionist }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.marketing + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.marketing,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
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
    color: Colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: Spacing.lg,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textDim,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  notesText: {
    color: Colors.text,
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    marginTop: Spacing.xxl,
  },
});
