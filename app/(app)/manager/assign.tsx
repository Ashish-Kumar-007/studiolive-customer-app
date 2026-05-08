import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { apiClient } from '../../../src/api/client';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';

interface Lead {
  id: string;
  name: string;
  business: string;
  status: string;
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

export default function AssignTask() {
  const { user, isAuthenticated } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'SHOOT',
    leadId: '',
    assignedId: '',
    deadline: ''
  });
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [leadsRes, usersRes] = await Promise.all([
        apiClient.get('/leads'),
        apiClient.get('/users')
      ]);
      // Extract arrays, handling both direct arrays and paginated { data, meta } structures
      const leadsArray = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.data || [];
      const usersArray = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];

      // Filter for CONVINCED leads
      setLeads(leadsArray.filter((l: any) => l.status === 'CONVINCED'));
      // Filter for production staff (VIDEOGRAPHER, EDITOR)
      setUsers(usersArray.filter((u: any) => u.role === 'VIDEOGRAPHER' || u.role === 'EDITOR'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!form.leadId || !form.assignedId || !form.deadline) {
      Alert.alert('Required Fields', 'Please select a lead, staff member, and deadline.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/tasks', form);
      Alert.alert('Success', 'Task assigned successfully!');
      router.replace('/(app)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.manager} />
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.container}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>Assign New Task</Text>
          <Text style={styles.subtitle}>Select a qualified lead and delegate to staff</Text>
        </View>

        <Text style={styles.sectionTitle}>Task Configuration</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Task Type</Text>
          <View style={styles.pickerContainer}>
            <Button 
              title="SHOOT" 
              variant={form.type === 'SHOOT' ? 'primary' : 'outline'} 
              onPress={() => setForm({ ...form, type: 'SHOOT' })}
              style={styles.typeButton}
            />
            <Button 
              title="EDIT" 
              variant={form.type === 'EDIT' ? 'primary' : 'outline'} 
              onPress={() => setForm({ ...form, type: 'EDIT' })}
              style={styles.typeButton}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Lead Delegation</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Select Convinced Lead</Text>
          {leads.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
              {leads.map((lead: any) => (
                <TouchableOpacity 
                  key={lead.id} 
                  style={[styles.selectorItem, form.leadId === lead.id && styles.selectedItem]}
                  onPress={() => setForm({ ...form, leadId: lead.id })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectorText, form.leadId === lead.id && styles.selectedText]}>{lead.name}</Text>
                  <Text style={styles.selectorSub}>{lead.business}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No convinced leads available.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Staff Delegation</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Assign To Staff</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
            {users.map((user: any) => (
              <TouchableOpacity 
                key={user.id} 
                style={[styles.selectorItem, form.assignedId === user.id && styles.selectedItem]}
                onPress={() => setForm({ ...form, assignedId: user.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectorText, form.assignedId === user.id && styles.selectedText]}>{user.name}</Text>
                <Text style={styles.selectorSub}>{user.role}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Deadline (YYYY-MM-DD)"
            placeholder="2026-04-30"
            value={form.deadline}
            onChangeText={(text) => setForm({ ...form, deadline: text })}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Assign Task" 
          onPress={handleSubmit} 
          loading={submitting}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Re-using some styles from other screens
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 4,
  },
  label: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  typeButton: {
    flex: 1,
    height: 52,
    borderRadius: Radius.xl,
  },
  selector: {
    marginBottom: Spacing.md,
  },
  selectorItem: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    borderColor: Colors.manager,
    backgroundColor: Colors.manager + '15',
  },
  selectorText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  selectedText: {
    color: Colors.manager,
  },
  selectorSub: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textDark,
    fontSize: 13,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  submitButton: {
    height: 56,
    backgroundColor: Colors.manager,
    borderRadius: Radius.full,
  },
});
