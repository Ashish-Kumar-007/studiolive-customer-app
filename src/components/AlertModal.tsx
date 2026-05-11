import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme, Radius, Spacing } from '../constants/theme';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

const VARIANT_CONFIG: Record<AlertVariant, { icon: any; color: string; label: string }> = {
  error:   { icon: XCircle,       color: '#EF4444', label: 'Got it' },
  warning: { icon: AlertTriangle, color: '#F59E0B', label: 'OK' },
  success: { icon: CheckCircle2,  color: '#10B981', label: 'Great' },
  info:    { icon: Info,          color: '#6366F1', label: 'OK' },
};

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: AlertVariant;
  buttonText?: string;
  onClose: () => void;
}

export function AlertModal({
  visible,
  title,
  message,
  variant = 'info',
  buttonText,
  onClose,
}: AlertModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { icon: Icon, color, label } = VARIANT_CONFIG[variant];

  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Icon */}
          <View style={[styles.iconBg, { backgroundColor: color + '18' }]}>
            <View style={[styles.iconRing, { borderColor: color + '35' }]}>
              <Icon size={26} color={color} />
            </View>
          </View>

          {/* Text */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{buttonText || label}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface AlertOptions {
  title: string;
  message: string;
  variant?: AlertVariant;
  buttonText?: string;
}

/**
 * useAlert — drop-in replacement for Alert.alert with a single dismiss button.
 *
 * Usage:
 *   const { showAlert, AlertDialog } = useAlert();
 *   showAlert({ title: 'Error', message: '...', variant: 'error' });
 *   return <View>...<AlertDialog /></View>
 */
export function useAlert() {
  const [state, setState] = React.useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (opts: AlertOptions) => {
    setState({ ...opts, visible: true });
  };

  const handleClose = () => setState((s) => ({ ...s, visible: false }));

  const AlertDialog = () => (
    <AlertModal
      visible={state.visible}
      title={state.title}
      message={state.message}
      variant={state.variant}
      buttonText={state.buttonText}
      onClose={handleClose}
    />
  );

  return { showAlert, AlertDialog };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
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
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.35,
      shadowRadius: 28,
      elevation: 16,
    },
    iconBg: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    iconRing: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      letterSpacing: -0.2,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: theme.textDim,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.sm,
    },
    btn: {
      width: '100%',
      height: 52,
      borderRadius: Radius.full,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    btnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
    },
  });
