import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'home' | 'courses' | 'messages' | 'settings';
type IconName = keyof typeof Ionicons.glyphMap;

type TabItem = {
  key: TabKey;
  label: string;
  icon: IconName;
};

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home' as IconName },
  { key: 'courses', label: 'Courses', icon: 'play-circle-outline' as IconName },
  { key: 'messages', label: 'Messages', icon: 'chatbubble-ellipses-outline' as IconName },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' as IconName },
];


type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export const LiquidGlassTabBar: React.FC<Props> = ({ active, onChange }) => {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <BlurView intensity={60} tint="light" style={styles.blurCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.25)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <View style={styles.row}>
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onChange(tab.key)}
                style={({ pressed }) => [
                  styles.item,
                  isActive && styles.itemActive,
                  pressed && styles.itemPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                  <Ionicons
                    name={tab.icon}
                    size={22}
                    color={isActive ? tokens.color.primary700 : tokens.color.iconDefault}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: isActive ? tokens.color.primary700 : tokens.color.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

/* Design tokens (tweak here first) */
const tokens = {
  radius: {
    glass: 28,
    icon: 22,
  },
  spacing: {
    cardPadding: 12,
    gap: 10,
    iconGap: 8,
  },
  color: {
    primary700: '#2F2D87', // matches your header/nav hue
    iconDefault: '#3C3C55',
    textSecondary: '#444B59',
    shadow: 'rgba(20, 24, 45, 0.18)',
    innerShadow: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255,255,255,0.35)',
  },
  blur: 60,
};

type Styles = {
  wrapper: ViewStyle;
  blurCard: ViewStyle;
  gradient: ViewStyle;
  row: ViewStyle;
  item: ViewStyle;
  itemActive: ViewStyle;
  itemPressed: ViewStyle;
  iconCircle: ViewStyle;
  iconCircleActive: ViewStyle;
  label: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
  },
  blurCard: {
    borderRadius: tokens.radius.glass,
    overflow: 'hidden',
    padding: tokens.spacing.cardPadding,
    borderWidth: 1,
    borderColor: tokens.color.border,
    shadowColor: tokens.color.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.gap,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: tokens.spacing.iconGap / 2,
    paddingVertical: 8,
    borderRadius: tokens.radius.icon * 1.4,
  },
  itemActive: {
    backgroundColor: 'rgba(47,45,135,0.12)', // subtle highlight
    shadowColor: tokens.color.innerShadow,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  itemPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
  iconCircle: {
    width: tokens.radius.icon * 2,
    height: tokens.radius.icon * 2,
    borderRadius: tokens.radius.icon,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(47,45,135,0.14)',
    borderColor: 'rgba(47,45,135,0.35)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LiquidGlassTabBar;