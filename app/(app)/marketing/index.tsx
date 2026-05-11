import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme, Spacing, Radius } from '../../../src/constants/theme';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { apiClient } from '../../../src/api/client';
import { useRouter } from 'expo-router';
import { Target, ChevronDown, CheckCircle2 } from 'lucide-react-native';
import { useAlert } from '../../../src/components/AlertModal';

const LEAD_SOURCES = ['Instagram', 'Referral', 'Website', 'Google', 'Walk-in'];
const BUSINESS_TYPES = ['Real Estate', 'Corporate', 'Events', 'Restaurant', 'Product', 'Other'];

export default function MarketingLeads() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    business: 'Real Estate',
    source: 'Instagram',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { showAlert, AlertDialog } = useAlert();

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.business || !form.source) {
      showAlert({ title: 'Required Fields', message: 'Please complete all required fields.', variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/leads', form);
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      showAlert({ title: 'Error', message: error.response?.data?.message || 'Failed to capture lead', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (label: string, options: string[], selectedValue: string, dropdownKey: string, onSelect: (val: string) => void) => {
    const isOpen = openDropdown === dropdownKey;
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
          onPress={() => setOpenDropdown(isOpen ? null : dropdownKey)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownHeaderText}>{selectedValue || 'Select an option'}</Text>
          <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
            <ChevronDown size={20} color={theme.textDark} />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            {options.map((opt) => {
              const isSelected = selectedValue === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(opt);
                    setOpenDropdown(null);
                  }}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                    {opt}
                  </Text>
                  {isSelected && <CheckCircle2 size={18} color={theme.marketing} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Target size={28} color={theme.marketing} />
            </View>
            <Text style={styles.title}>Capture Prospect</Text>
            <Text style={styles.subtitle}>Enter details to inject a new lead into the pipeline</Text>
          </View>

          <Text style={styles.sectionTitle}>Client Details</Text>
          <View style={styles.card}>
            <Input
              label="Client or Business Name"
              placeholder="e.g. Acme Corp / John Doe"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />

            <Input
              label="Contact Number"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>Project Scope</Text>
          <View style={styles.card}>
            {renderDropdown('Business Sector', BUSINESS_TYPES, form.business, 'business', (val) => setForm({ ...form, business: val }))}
            
            {renderDropdown('Acquisition Source', LEAD_SOURCES, form.source, 'source', (val) => setForm({ ...form, source: val }))}

            <Input
              label="Project Notes & Requirements"
              placeholder="What exactly are they looking for?"
              value={form.notes}
              onChangeText={(text) => setForm({ ...form, notes: text })}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Inject Lead"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            style={styles.submitBtn}
          />
        </View>

        {/* Success Modal Overlay */}
        {showSuccess && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalGlow} />
              <View style={styles.successIconContainer}>
                <CheckCircle2 size={40} color={theme.success} />
              </View>
              <Text style={styles.modalTitle}>Lead Injected</Text>
              <Text style={styles.modalDesc}>
                The prospect <Text style={{ color: theme.marketing, fontWeight: '800' }}>{form.name}</Text> has been successfully added to the production pipeline.
              </Text>
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => {
                  setShowSuccess(false);
                  setForm({ name: '', phone: '', business: 'Real Estate', source: 'Instagram', notes: '' });
                  router.replace('/(app)');
                }}
              >
                <Text style={styles.modalBtnText}>Acknowledge</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
      <AlertDialog />
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.marketing + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textDim,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: theme.surface,
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  dropdownHeaderOpen: {
    borderColor: theme.marketing,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.marketing,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border + '50',
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '800',
    color: theme.marketing,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  submitBtn: {
    backgroundColor: theme.marketing,
    height: 56,
    borderRadius: Radius.full,
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
    backgroundColor: theme.success + '15',
    opacity: 0.5,
  },
  successIconContainer: {
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
    backgroundColor: theme.marketing,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.marketing,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
