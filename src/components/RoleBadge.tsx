import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Radius, Spacing } from '../constants/theme';
import { UserRole } from '../store/authStore';

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const theme = useTheme();

  const getRoleConfig = () => {
    switch (role) {
      case 'ADMIN': return { color: theme.admin, label: 'ADMIN' };
      case 'MANAGER': return { color: theme.manager, label: 'MANAGER' };
      case 'MARKETING': return { color: theme.marketing, label: 'MARKETING' };
      case 'RECEPTIONIST': return { color: theme.receptionist, label: 'RECEPTIONIST' };
      case 'VIDEOGRAPHER': return { color: theme.videographer, label: 'VIDEOGRAPHER' };
      case 'EDITOR': return { color: theme.editor, label: 'EDITOR' };
      default: return { color: theme.textDim, label: role };
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
