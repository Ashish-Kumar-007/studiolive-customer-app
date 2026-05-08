import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { LogOut, Settings, User, ShieldCheck, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';

const { height } = Dimensions.get('window');

import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, logout, biometricsEnabled } = useAuthStore();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getRoleColor = (role: string | undefined) => {
    const map: Record<string, string> = {
      ADMIN: theme.admin,
      MANAGER: theme.manager,
      MARKETING: theme.marketing,
      RECEPTIONIST: theme.receptionist,
      VIDEOGRAPHER: theme.videographer,
      EDITOR: theme.editor,
    };
    return map[role || ''] || theme.textDim;
  };

  const roleColor = getRoleColor(user?.role);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Security Notice', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'The passwords entered do not match.');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch('/auth/change-password', { newPassword });
      
      // Sync with biometrics if enabled
      if (biometricsEnabled) {
        await SecureStore.setItemAsync('user_password', newPassword);
      }

      Alert.alert('Success', 'Your security credentials have been updated.');
      setShowPasswordPanel(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const renderOption = (title: string, icon: any, color: string, onPress: () => void) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 20, color: color })}
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <ShieldCheck size={16} color={theme.textDark} style={{ opacity: 0.3 }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.base}>
      <LinearGradient
        colors={[theme.background, theme.surfaceLight, theme.background]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.headerCard}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarPulse, { backgroundColor: roleColor }]} />
              <View style={[styles.avatar, { borderColor: roleColor + '40', backgroundColor: theme.background }]}>
                <User size={44} color={theme.text} />
              </View>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '10', borderColor: roleColor + '30' }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>{user?.role} ACCESS</Text>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Mail size={16} color={roleColor} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>SYSTEM IDENTITY</Text>
                  <Text style={styles.infoText}>{user?.email}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                <View style={styles.infoIconBox}>
                  <Phone size={16} color={roleColor} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>SECURE LINE</Text>
                  <Text style={styles.infoText}>{user?.phone || 'UNREGISTERED'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={14} color={roleColor} />
              <Text style={[styles.sectionLabel, { color: roleColor }]}>ACCOUNT PROTOCOLS</Text>
            </View>
            <View style={styles.optionsCard}>
              {renderOption('Credential Security', Lock, roleColor, () => setShowPasswordPanel(true))}
              {renderOption('System Config', Settings, roleColor, () => router.push('/(app)/settings'))}
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LinearGradient
              colors={[theme.error + '15', theme.error + '05']}
              style={[styles.logoutGradient, { borderColor: theme.error + '20' }]}
            >
              <LogOut size={20} color={theme.error} />
              <Text style={[styles.logoutText, { color: theme.error }]}>Terminate Access</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.versionText}>STUDIOLIVE OS v1.0.4 // ENCRYPTED NODE</Text>
        </ScrollView>

        {/* Change Password Panel (Bottom Sheet) */}
        <Modal
          visible={showPasswordPanel}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPasswordPanel(false)}
        >
          <View style={styles.panelOverlay}>
            <TouchableOpacity
              style={styles.panelBackdrop}
              activeOpacity={1}
              onPress={() => setShowPasswordPanel(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.panelContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
            >
              <View style={styles.panelContent}>
                <View style={styles.panelHandle} />

                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <View style={[styles.shieldIconBox, { backgroundColor: roleColor + '30' }]}>
                      <Lock size={20} color={roleColor} />
                    </View>
                    <View>
                      <Text style={[styles.passTitle, { color: theme.text }]}>Security clearance</Text>
                      <Text style={styles.passSub}>Update your digital access keys</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowPasswordPanel(false)}>
                    <View style={[styles.closeBtn, { backgroundColor: theme.border }]}>
                      <X size={20} color={theme.textDark} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.panelBody}>
                  <View style={styles.inputWrap}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>NEW ACCESS KEY</Text>
                      {newPassword.length > 0 && (
                        <Text style={[styles.strengthText, { color: newPassword.length < 8 ? theme.error : theme.success }]}>
                          {newPassword.length < 8 ? 'Weak' : 'Strong'}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="At least 6 characters..."
                        secureTextEntry={!showPass}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor={theme.textDark}
                      />
                      <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                        {showPass ? <EyeOff size={18} color={theme.textDark} /> : <Eye size={18} color={theme.textDark} />}
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.meterBg, { backgroundColor: theme.border }]}>
                      <View style={[
                        styles.meterFill,
                        {
                          width: `${Math.min((newPassword.length / 12) * 100, 100)}%`,
                          backgroundColor: newPassword.length < 6 ? theme.error : (newPassword.length < 10 ? theme.warning : theme.success)
                        }
                      ]} />
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>CONFIRM ACCESS KEY</Text>
                    <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="Repeat for confirmation"
                        secureTextEntry={!showPass}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholderTextColor={theme.textDark}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleUpdatePassword}
                    disabled={updating}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={updating ? [theme.border, theme.background] : [roleColor, roleColor + 'CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.updateBtn}
                    >
                      {updating ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.updateBtnText}>Authorize Change</Text>
                          <ShieldCheck size={18} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.modalIconBg, { backgroundColor: theme.error + '15' }]}>
                <LogOut size={32} color={theme.error} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Sign Out?</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textDim }]}>Are you sure you want to sign out of your account?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: theme.border, borderColor: theme.border }]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: theme.error }]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.confirmBtnText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerCard: {
    backgroundColor: theme.surface + 'B3',
    padding: 30,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 25,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userName: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginTop: 10,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: theme.surface + 'B3',
    borderRadius: Radius.xxxl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoLabel: {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
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
    letterSpacing: 2,
    color: theme.textDim,
  },
  optionsCard: {
    backgroundColor: theme.surface + 'B3',
    borderRadius: Radius.xxxl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.xl,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionTitle: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  panelOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  panelBackdrop: {
    flex: 1,
  },
  panelContainer: {
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: height * 0.8,
    borderTopWidth: 1,
  },
  panelContent: {
    padding: Spacing.xl,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  shieldIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  passSub: {
    fontSize: 12,
    color: theme.textDim,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelBody: {
    gap: Spacing.lg,
  },
  inputWrap: {
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.textDim,
    letterSpacing: 1,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  eyeIcon: {
    padding: 8,
  },
  meterBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 2,
  },
  updateBtn: {
    height: 58,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  logoutBtn: {
    marginTop: 10,
    borderRadius: Radius.xxxl,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    borderRadius: Radius.xxxl,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: 'center',
    color: theme.textDim,
    fontSize: 10,
    marginTop: 40,
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
    borderRadius: Radius.xxxl,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    fontWeight: '500',
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
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
