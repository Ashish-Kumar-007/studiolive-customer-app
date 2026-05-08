import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { UserRole } from '../store/authStore';

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'ADMIN': return { color: Colors.admin, label: 'ADMIN' };
      case 'MANAGER': return { color: Colors.manager, label: 'MANAGER' };
      case 'MARKETING': return { color: Colors.marketing, label: 'MARKETING' };
      case 'RECEPTIONIST': return { color: Colors.receptionist, label: 'RECEPTIONIST' };
      case 'VIDEOGRAPHER': return { color: Colors.videographer, label: 'VIDEOGRAPHER' };
      case 'EDITOR': return { color: Colors.editor, label: 'EDITOR' };
      default: return { color: Colors.textDim, label: role };
    }
  };

  const config = getRoleConfig();

  return (
    <View style={[styles.badge, { borderColor: config.color + '40', backgroundColor: config.color + '15' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
