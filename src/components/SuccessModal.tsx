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
import { CheckCircle2 } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  detail?: string;       // e.g. email address of newly created user
  buttonText?: string;
  onDone: () => void;
}

export function SuccessModal({
  visible,
  title = 'Success',
  message,
  detail,
  buttonText = 'Done',
  onDone,
}: SuccessModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const scaleAnim  = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScale  = useRef(new Animated.Value(0)).current;
  const ring1Anim  = useRef(new Animated.Value(0)).current;
  const ring2Anim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Card entrance
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        // Checkmark pop
        Animated.spring(checkScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }).start();
        // Expanding rings
        Animated.stagger(120, [
          Animated.timing(ring1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(ring2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      checkScale.setValue(0);
      ring1Anim.setValue(0);
      ring2Anim.setValue(0);
    }
  }, [visible]);

  const ring1Scale  = ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.6] });
  const ring1Opacity = ring1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] });
  const ring2Scale  = ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.0] });
  const ring2Opacity = ring2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.15, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDone}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>

          {/* Animated rings + icon */}
          <View style={styles.iconArea}>
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
            <View style={styles.iconCircle}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <CheckCircle2 size={40} color="#10B981" />
              </Animated.View>
            </View>
          </View>

          {/* Text */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {detail ? (
            <View style={styles.detailPill}>
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ) : null}

          {/* Credential hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>📧 Login credentials have been sent to their email</Text>
          </View>

          {/* Action */}
          <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface SuccessOptions {
  title?: string;
  message: string;
  detail?: string;
  buttonText?: string;
}

export function useSuccess() {
  const [state, setState] = React.useState<SuccessOptions & { visible: boolean }>({
    visible: false,
    message: '',
  });

  const showSuccess = (opts: SuccessOptions) => {
    setState({ ...opts, visible: true });
  };

  const handleDone = () => {
    setState((s) => ({ ...s, visible: false }));
  };

  const SuccessDialog = () => (
    <SuccessModal
      visible={state.visible}
      title={state.title}
      message={state.message}
      detail={state.detail}
      buttonText={state.buttonText}
      onDone={handleDone}
    />
  );

  return { showSuccess, SuccessDialog };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    card: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: Radius.xxxl,
      padding: Spacing.xl,
      paddingTop: 36,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 20,
    },
    iconArea: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    ring: {
      position: 'absolute',
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#10B981',
    },
    ring1: { width: 80, height: 80 },
    ring2: { width: 80, height: 80 },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#10B98118',
      borderWidth: 1.5,
      borderColor: '#10B98140',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.3,
      marginBottom: 8,
    },
    message: {
      fontSize: 15,
      color: theme.textDim,
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: 22,
      marginBottom: Spacing.md,
    },
    detailPill: {
      backgroundColor: '#10B98115',
      borderWidth: 1,
      borderColor: '#10B98130',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.lg,
      paddingVertical: 8,
      marginBottom: Spacing.lg,
    },
    detailText: {
      fontSize: 13,
      color: '#10B981',
      fontWeight: '700',
    },
    hintBox: {
      backgroundColor: theme.background,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.xl,
      width: '100%',
    },
    hintText: {
      fontSize: 13,
      color: theme.textDim,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 20,
    },
    doneBtn: {
      width: '100%',
      height: 54,
      borderRadius: Radius.full,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    doneBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
  });
