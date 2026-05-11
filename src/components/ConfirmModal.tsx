import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme, Radius, Spacing } from '../constants/theme';
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react-native';

export type ConfirmVariant = 'danger' | 'success' | 'info' | 'warning';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG: Record<ConfirmVariant, { icon: any; color: string }> = {
  danger:  { icon: Trash2,         color: '#EF4444' },
  warning: { icon: AlertTriangle,  color: '#F59E0B' },
  success: { icon: CheckCircle2,   color: '#10B981' },
  info:    { icon: Info,           color: '#6366F1' },
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { icon: Icon, color } = VARIANT_CONFIG[variant];

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
            <X size={18} color={theme.textDim} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconBg, { backgroundColor: color + '18' }]}>
            <View style={[styles.iconRing, { borderColor: color + '30' }]}>
              <Icon size={28} color={color} />
            </View>
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: color }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * useConfirm — drop-in replacement for Alert.alert confirmation dialogs.
 *
 * Usage:
 *   const { confirmState, showConfirm, ConfirmDialog } = useConfirm();
 *   ...
 *   const ok = await showConfirm({ title: 'Delete?', message: '...', variant: 'danger' });
 *   if (ok) doDelete();
 *   ...
 *   return <View>...<ConfirmDialog /></View>
 */
export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState>({
    visible: false,
    title: '',
    message: '',
  });

  const showConfirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, visible: true, resolve });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, visible: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, visible: false }));
  };

  const ConfirmDialog = () => (
    <ConfirmModal
      visible={state.visible}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { showConfirm, ConfirmDialog };
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    card: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: Radius.xxxl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 20,
    },
    closeBtn: {
      position: 'absolute',
      top: Spacing.lg,
      right: Spacing.lg,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBg: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      marginTop: Spacing.sm,
    },
    iconRing: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      letterSpacing: -0.3,
      marginBottom: Spacing.sm,
    },
    message: {
      fontSize: 14,
      color: theme.textDim,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.md,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      height: 52,
      borderRadius: Radius.full,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelText: {
      color: theme.textDim,
      fontSize: 15,
      fontWeight: '700',
    },
    confirmBtn: {
      flex: 1,
      height: 52,
      borderRadius: Radius.full,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    confirmText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
    },
  });
