import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { LogOut, Settings, User, ShieldCheck, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const getRoleColor = (role: string | undefined) => {
    const map: Record<string, string> = {
      ADMIN: Colors.admin,
      MANAGER: Colors.manager,
      MARKETING: Colors.marketing,
      RECEPTIONIST: Colors.receptionist,
      VIDEOGRAPHER: Colors.videographer,
      EDITOR: Colors.editor,
    };
    return map[role || ''] || Colors.textDim;
  };

  const roleColor = getRoleColor(user?.role);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const renderOption = (title: string, icon: any, color: string, onPress: () => void) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 20, color: color })}
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <ShieldCheck size={16} color={Colors.textDark} style={{ opacity: 0.3 }} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <User size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{user?.role}</Text>
        </View>
      </View>

      {/* User Details */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Mail size={16} color={Colors.textDim} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        {user?.phone && (
          <View style={styles.infoRow}>
            <Phone size={16} color={Colors.textDim} />
            <Text style={styles.infoText}>{user?.phone}</Text>
          </View>
        )}
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.optionsCard}>
          {renderOption('Change Password', ShieldCheck, roleColor, () => router.push('/(auth)/change-password'))}
          {renderOption('App Settings', Settings, Colors.textDim, () => router.push('/(app)/settings'))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>StudioLive v1.0.0</Text>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <LogOut size={32} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to sign out of your account?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    color: Colors.text,
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  optionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.error + '10',
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    marginTop: Spacing.md,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: Colors.textDark,
    fontSize: 10,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxxl,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: Colors.textDim,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    height: 54,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.error,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
