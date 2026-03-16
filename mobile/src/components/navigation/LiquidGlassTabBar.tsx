import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
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

const LiquidGlassTabBar = ({ state, descriptors, navigation, tabs }: Props) => {
  const insets = useSafeAreaInsets();

  const scaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;
  const translateYAnims = useRef(tabs.map(() => new Animated.Value(0))).current;
  const pillAnims = useRef(tabs.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  useEffect(() => {
    tabs.forEach((_, index) => {
      const isActive = index === state.index;
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: isActive ? 1.08 : 1,
          useNativeDriver: true,
          tension: 180,
          friction: 10,
        }),
        Animated.spring(translateYAnims[index], {
          toValue: isActive ? -2 : 0,
          useNativeDriver: true,
          tension: 180,
          friction: 10,
        }),
        Animated.timing(pillAnims[index], {
          toValue: isActive ? 1 : 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [state.index]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.bar}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];
          const descriptor = descriptors[route?.key];
          const label = descriptor?.options?.title ?? tab.label;

          const pillScale = pillAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
          });
          const pillOpacity = pillAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
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
              activeOpacity={0.7}
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
                {/* Active pill */}
                <Animated.View
                  style={[
                    styles.pill,
                    {
                      opacity: pillOpacity,
                      transform: [{ scale: pillScale }],
                    },
                  ]}
                />

                <Ionicons
                  name={isFocused ? tab.iconFocused : tab.icon}
                  size={23}
                  color={isFocused ? '#21277B' : '#9CA3AF'}
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
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 4,
  },
  iconArea: {
    width: 48,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    width: 48,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(33,39,123,0.10)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  labelOn: { color: '#21277B' },
  labelOff: { color: '#9CA3AF' },
});

export default LiquidGlassTabBar;
