import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

interface Props {
  state: any;
  descriptors: any;
  navigation: any;
  tabs: TabItem[];
}

// Brand palette
const ACTIVE_COLOR   = '#21277B';
const INACTIVE_COLOR = 'rgba(150,160,200,0.7)';
const PILL_BG_START  = 'rgba(255,255,255,0.55)';
const PILL_BG_END    = 'rgba(200,210,255,0.35)';
const PILL_BORDER    = 'rgba(255,255,255,0.70)';

const LiquidGlassTabBar = ({ state, descriptors, navigation, tabs }: Props) => {
  const insets = useSafeAreaInsets();

  const scaleAnims    = useRef(tabs.map(() => new Animated.Value(1))).current;
  const translateYAnims = useRef(tabs.map(() => new Animated.Value(0))).current;
  const pillAnims     = useRef(tabs.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const glowAnims     = useRef(tabs.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  useEffect(() => {
    tabs.forEach((_, index) => {
      const isActive = index === state.index;
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: isActive ? 1.12 : 1,
          useNativeDriver: true,
          tension: 200,
          friction: 9,
        }),
        Animated.spring(translateYAnims[index], {
          toValue: isActive ? -4 : 0,
          useNativeDriver: true,
          tension: 200,
          friction: 9,
        }),
        Animated.spring(pillAnims[index], {
          toValue: isActive ? 1 : 0,
          useNativeDriver: false,
          tension: 200,
          friction: 9,
        }),
        Animated.timing(glowAnims[index], {
          toValue: isActive ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [state.index]);

  const barPaddingBottom = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.outerWrapper, { paddingBottom: barPaddingBottom }]}>
      {/* Shadow wrapper (no overflow so shadow isn't clipped on iOS) */}
      <View style={styles.shadowWrapper}>
      {/* Floating glass pill container — clips blur/gradient to border radius */}
      <View style={styles.barContainer}>
        {/* Blur layer – gives the frosted-glass look */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 60}
          tint="light"
          style={StyleSheet.absoluteFill}
        />

        {/* Subtle white-to-blue gradient overlay on top of the blur */}
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(220,228,255,0.40)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top highlight edge — the "glass rim" */}
        <View style={styles.topHighlight} />

        {/* Tab items */}
        <View style={styles.bar}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;
            const route = state.routes[index];
            const descriptor = descriptors[route?.key];
            const label = descriptor?.options?.title ?? tab.label;

            const pillWidth = pillAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 52],
            });
            const pillHeight = pillAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 38],
            });
            const pillOpacity = pillAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });
            const glowOpacity = glowAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.55],
            });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route?.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route?.name ?? tab.name);
              }
            };

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.75}
              >
                <Animated.View
                  style={[
                    styles.iconArea,
                    {
                      transform: [
                        { scale: scaleAnims[index] },
                        { translateY: translateYAnims[index] },
                      ],
                    },
                  ]}
                >
                  {/* Glow halo behind icon (active only) */}
                  <Animated.View
                    style={[
                      styles.glow,
                      { opacity: glowOpacity },
                    ]}
                  />

                  {/* Liquid glass pill (active indicator) */}
                  <Animated.View
                    style={[
                      styles.pill,
                      {
                        width: pillWidth,
                        height: pillHeight,
                        opacity: pillOpacity,
                      },
                    ]}
                  >
                    {/* Inner gradient of the active pill */}
                    <LinearGradient
                      colors={[PILL_BG_START, PILL_BG_END]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    {/* Pill border highlight */}
                    <View style={styles.pillBorder} />
                  </Animated.View>

                  <Ionicons
                    name={isFocused ? tab.iconFocused : tab.icon}
                    size={22}
                    color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                </Animated.View>

                <Text style={[styles.label, isFocused ? styles.labelOn : styles.labelOff]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </View>
      </View>
    </View>
  );
};

const BAR_RADIUS = 28;

const styles = StyleSheet.create({
  outerWrapper: {
    // Transparent so the screen content shows through under the floating bar
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  shadowWrapper: {
    borderRadius: BAR_RADIUS,
    // Drop shadow on the wrapper (not clipped by overflow: hidden)
    ...Platform.select({
      ios: {
        shadowColor: '#3B4CB8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.20,
        shadowRadius: 24,
      },
      android: { elevation: 20 },
    }),
  },
  barContainer: {
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    // Thin border for the glass edge
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: PILL_BORDER,
    borderRadius: 1,
    zIndex: 2,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconArea: {
    width: 52,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 52,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(100,115,220,0.15)',
    // The blur of this view simulates a glow (on iOS the shadow does the work)
    ...Platform.select({
      ios: {
        shadowColor: '#5B6FE8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
    }),
  },
  pill: {
    position: 'absolute',
    borderRadius: 19,
    overflow: 'hidden',
  },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: PILL_BORDER,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  labelOn: { color: ACTIVE_COLOR },
  labelOff: { color: INACTIVE_COLOR },
});

export default LiquidGlassTabBar;
