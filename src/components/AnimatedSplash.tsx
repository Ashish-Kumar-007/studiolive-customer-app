import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Easing } from 'react-native';

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: Props) {
  // Animation values
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Step 1: Icon pops in with rotation
    Animated.sequence([
      Animated.delay(200),

      // Icon entrance — scale + rotate + fade in
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // Ring pulse
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.6,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Text slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // Hold for 800ms then exit
      Animated.delay(800),

      // Fade out whole screen
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <View style={styles.center}>
        {/* Pulse ring behind icon */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />

        {/* Icon */}
        <Animated.View
          style={{
            transform: [{ scale: iconScale }, { rotate: spin }],
            opacity: iconOpacity,
          }}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/icon_only.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand name */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
            marginTop: 28,
          }}
        >
          <Animated.Text style={styles.brandName}>
            STUDIO<Animated.Text style={styles.brandHighlight}>LIVE</Animated.Text>
          </Animated.Text>
          <Animated.Text style={styles.brandSub}>PREMIUM PRODUCTION</Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070709',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#FF4D4D',
    opacity: 0,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  icon: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e8e8e8',
    letterSpacing: 5,
  },
  brandHighlight: {
    color: '#FF4D4D',
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#444',
    letterSpacing: 4,
    marginTop: 6,
  },
});
