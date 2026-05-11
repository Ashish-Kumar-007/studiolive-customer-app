import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useTheme, Radius, Spacing } from '../../src/constants/theme';
import { Bell, Shield, Smartphone, Globe, Moon, ChevronRight, Volume2, Fingerprint, Settings, Sparkles, Zap, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore, ThemeMode } from '../../src/store/settingsStore';
import { Input } from '../../src/components/Input';
import { AppModal } from '../../src/components/AppModal';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, biometricsEnabled, setBiometricsEnabled } = useAuthStore();
  const { themeMode, setThemeMode } = useSettingsStore();
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sound: true,
  });

  const [security, setSecurity] = useState({
    privacyMode: false,
  });

  const [showBioSync, setShowBioSync] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [syncing, setSyncing] = useState(false);

  const getThemeLabel = useCallback((mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Studio Light';
      case 'dark': return 'Elite Dark';
      case 'system': return 'System Default';
      default: return 'System Default';
    }
  }, []);

  const handleToggleBiometrics = useCallback(async () => {
    if (biometricsEnabled) {
      await setBiometricsEnabled(false);
      await SecureStore.deleteItemAsync('user_password');
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Hardware Required', 'Biometric hardware is not available or no fingerprints/faces are enrolled on this device.');
      return;
    }

    setShowBioSync(true);
  }, [biometricsEnabled, setBiometricsEnabled]);

  const confirmBioSync = useCallback(async () => {
    if (!verifyPassword) {
      Alert.alert('Required', 'Please enter your current password to sync biometrics.');
      return;
    }

    setSyncing(true);
    try {
      await SecureStore.setItemAsync('user_email', user?.email || '');
      await SecureStore.setItemAsync('user_password', verifyPassword);
      await setBiometricsEnabled(true);
      
      Alert.alert('Protocol Synced', 'Biometric access has been securely linked to your credentials.');
      setShowBioSync(false);
      setVerifyPassword('');
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to securely store credentials.');
    } finally {
      setSyncing(false);
    }
  }, [user?.email, verifyPassword, setBiometricsEnabled]);

  const toggleSwitch = useCallback((key: string, section: 'notifications' | 'security') => {
    if (section === 'notifications') {
      setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }));
    } else {
      setSecurity(prev => ({ ...prev, [key]: !prev[key as keyof typeof security] }));
    }
  }, [notifications, security]);

  const renderSettingRow = useCallback((icon: any, title: string, subtitle: string, value: any, onValueChange?: () => void, type: 'switch' | 'link' = 'switch') => (
    <View style={[styles.settingRow, { borderBottomColor: theme.border + '50' }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
          {React.createElement(icon, { size: 18, color: theme.videographer })}
        </View>
        <View>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.border, true: theme.videographer }}
          thumbColor={value ? '#fff' : theme.textDark}
        />
      ) : (
        <ChevronRight size={18} color={theme.textDim} />
      )}
    </View>
  ), [theme, styles]);

  return (
    <View style={[styles.base, { backgroundColor: theme.background }]}>
      <LinearGradient 
        colors={[theme.background, theme.surfaceLight, theme.background]} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Operations Center</Text>
                <Text style={styles.headerSub}>Advanced system configuration</Text>
              </View>
              <View style={[styles.pulseContainer, { backgroundColor: theme.videographer + '15' }]}>
                <View style={[styles.pulse, { backgroundColor: theme.videographer }]} />
                <Zap size={20} color={theme.videographer} />
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={14} color={theme.videographer} />
              <Text style={[styles.sectionLabel, { color: theme.videographer }]}>INTELLIGENCE ALERTS</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.surface + 'B3', borderColor: theme.border }]}>
              {renderSettingRow(Smartphone, "Push Notifications", "Real-time lead & task alerts", notifications.push, () => toggleSwitch('push', 'notifications'))}
              {renderSettingRow(Volume2, "Audio Feedback", "Signature acoustic notifications", notifications.sound, () => toggleSwitch('sound', 'notifications'))}
              {renderSettingRow(Globe, "Global Reports", "Weekly enterprise intelligence", notifications.email, () => toggleSwitch('email', 'notifications'))}
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={14} color={theme.videographer} />
              <Text style={[styles.sectionLabel, { color: theme.videographer }]}>VAULT SECURITY</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.surface + 'B3', borderColor: theme.border }]}>
              {renderSettingRow(Fingerprint, "Biometric Auth", "FaceID & Fingerprint access", biometricsEnabled, handleToggleBiometrics)}
              {renderSettingRow(ShieldAlert, "Data Cloaking", "Hide high-value financial data", security.privacyMode, () => toggleSwitch('privacyMode', 'security'))}
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={14} color={theme.videographer} />
              <Text style={[styles.sectionLabel, { color: theme.videographer }]}>ENVIRONMENT</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.surface + 'B3', borderColor: theme.border }]}>
              <TouchableOpacity style={[styles.settingRow, { borderBottomColor: theme.border + '50' }]}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                    <Globe size={18} color={theme.videographer} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.text }]}>Core Language</Text>
                    <Text style={styles.settingSubtitle}>English (Enterprise)</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.textDim} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingRow, { borderBottomWidth: 0 }]}
                onPress={() => setShowThemeSelector(true)}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                    <Moon size={18} color={theme.videographer} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: theme.text }]}>Interface Theme</Text>
                    <Text style={styles.settingSubtitle}>{getThemeLabel(themeMode)}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.textDim} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.resetBtn}>
            <LinearGradient
              colors={[theme.error + '10', theme.error + '05']}
              style={[styles.resetGradient, { borderColor: theme.error + '20' }]}
            >
              <Text style={[styles.resetText, { color: theme.error }]}>Factory System Reset</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: theme.textDim }]}>BUILD: 1.0.4-ELITE // SECURE CONNECTION ACTIVE</Text>
        </ScrollView>

        {/* Biometric Sync Modal */}
        <AppModal
          visible={showBioSync}
          onClose={() => { setShowBioSync(false); setVerifyPassword(''); }}
          title="Sync Biometrics"
          subtitle="Enter your password to link this device's hardware"
          variant="center"
          accentColor={theme.videographer}
          scrollable={false}
          footer={
            <>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1, backgroundColor: theme.border, borderColor: theme.border }]}
                onPress={() => { setShowBioSync(false); setVerifyPassword(''); }}
                disabled={syncing}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Abort</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { flex: 1, backgroundColor: theme.videographer }]}
                onPress={confirmBioSync}
                disabled={syncing}
              >
                {syncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Authorize</Text>}
              </TouchableOpacity>
            </>
          }
        >
          <TextInput
            style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            placeholder="Current Access Key"
            placeholderTextColor={theme.textDim}
            secureTextEntry
            value={verifyPassword}
            onChangeText={setVerifyPassword}
            autoFocus
          />
        </AppModal>

        {/* Theme Selection Modal */}
        <AppModal
          visible={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          title="Visual Environment"
          subtitle="Select the interface protocol for your workspace"
          accentColor={theme.videographer}
          scrollable={false}
          footer={
            <TouchableOpacity
              style={[styles.cancelBtn, { flex: 1, backgroundColor: theme.border }]}
              onPress={() => setShowThemeSelector(false)}
            >
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.themeOptions}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && { backgroundColor: theme.videographer + '20', borderColor: theme.videographer }
                ]}
                onPress={() => { setThemeMode(mode); setShowThemeSelector(false); }}
              >
                <Text style={[styles.themeOptionText, { color: theme.text }, themeMode === mode && { color: theme.videographer }]}>
                  {getThemeLabel(mode)}
                </Text>
                {themeMode === mode && <CheckCircle2 size={18} color={theme.videographer} />}
              </TouchableOpacity>
            ))}
          </View>
        </AppModal>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1.5,
  },
  headerSub: {
    fontSize: 15,
    color: theme.textDim,
    fontWeight: '600',
    marginTop: 4,
  },
  pulseContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.videographer + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.videographer,
    opacity: 0.1,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.videographer,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: theme.surface + 'B3',
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border + '30',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.xl,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: theme.textDim,
    fontWeight: '600',
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 20,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  resetGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.error + '20',
    borderRadius: Radius.xl,
  },
  resetText: {
    color: theme.error,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerText: {
    textAlign: 'center',
    color: theme.textDim,
    fontSize: 10,
    marginTop: 30,
    fontWeight: '800',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: Radius.xxxl,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.videographer + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: theme.textDim,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    fontWeight: '500',
  },
  modalInput: {
    width: '100%',
    height: 56,
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    paddingHorizontal: 15,
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 25,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelBtnText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.videographer,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  themeOptions: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '700',
  }
});
