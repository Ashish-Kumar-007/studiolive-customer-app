import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../../src/constants/theme';
import { Input } from '../../../src/components/Input';
import Button from '../../../src/components/AppButton';
import { apiClient } from '../../../src/api/client';
import { useRouter } from 'expo-router';
import { Target, ChevronDown, CheckCircle2 } from 'lucide-react-native';

const LEAD_SOURCES = ['Instagram', 'Referral', 'Website', 'Google', 'Walk-in'];
const BUSINESS_TYPES = ['Real Estate', 'Corporate', 'Events', 'Restaurant', 'Product', 'Other'];

export default function MarketingLeads() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    business: 'Real Estate',
    source: 'Instagram',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.business || !form.source) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/leads', form);
      Alert.alert('Success', 'Lead captured successfully!', [
        {
          text: 'Great', onPress: () => {
            setForm({ name: '', phone: '', business: 'Real Estate', source: 'Instagram', notes: '' });
            router.replace('/(app)');
          }
        }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to capture lead');
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
            <ChevronDown size={20} color={Colors.textDark} />
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
                  {isSelected && <CheckCircle2 size={18} color={Colors.marketing} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Target size={28} color={Colors.marketing} />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
    backgroundColor: Colors.marketing + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textDim,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
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
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  dropdownHeaderOpen: {
    borderColor: Colors.marketing,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.marketing,
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
    borderBottomColor: Colors.border + '50',
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '800',
    color: Colors.marketing,
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
  submitBtn: {
    backgroundColor: Colors.marketing,
    height: 56,
    borderRadius: Radius.full,
  },
});
