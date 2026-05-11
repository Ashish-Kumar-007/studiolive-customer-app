import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, Radius, Spacing } from '../constants/theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 'sheet' slides up from bottom (default), 'center' appears in center */
  variant?: 'sheet' | 'center';
  /** Accent color for the header top border stripe */
  accentColor?: string;
  scrollable?: boolean;
}

const { height: SCREEN_H } = Dimensions.get('window');

export function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = 'sheet',
  accentColor,
  scrollable = true,
}: AppModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_H,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const accent = accentColor || '#FF4D4D';

  const Content = (
    <Animated.View
      style={[
        variant === 'sheet' ? styles.sheet : styles.centerCard,
        { transform: variant === 'sheet' ? [{ translateY: slideAnim }] : [] },
      ]}
    >
      {/* Accent stripe at top */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      {/* Handle (sheet only) */}
      {variant === 'sheet' && <View style={styles.handle} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={18} color={theme.textDim} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {scrollable ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.bodyContent}>{children}</View>
      )}

      {/* Footer */}
      {footer && <View style={styles.footer}>{footer}</View>}
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.root}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        {variant === 'sheet' ? (
          <View style={styles.sheetAnchor}>{Content}</View>
        ) : (
          <View style={styles.centerAnchor}>{Content}</View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    // ── Sheet variant ──
    sheetAnchor: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: SCREEN_H * 0.92,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    // ── Center variant ──
    centerAnchor: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    centerCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    // ── Shared ──
    accentBar: {
      height: 3,
      width: '100%',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerText: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textDim,
      marginTop: 3,
      fontWeight: '500',
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    body: {
      maxHeight: SCREEN_H * 0.55,
    },
    bodyContent: {
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    footer: {
      flexDirection: 'row',
      padding: Spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
      gap: Spacing.md,
    },
  });
