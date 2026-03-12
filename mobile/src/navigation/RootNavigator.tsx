import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthNavigator } from './AuthNavigator';
import ClientTabNavigator from './ClientTabNavigator';
import CoachTabNavigator from './CoachTabNavigator';
import { RootState, AppDispatch } from '../store';
import { restoreSession, dismissWelcomeBack } from '../store/slices/authSlice';
import { colors } from '../constants/colors';

const WelcomeBanner = ({ name }: { name: string }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        dispatch(dismissWelcomeBack());
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.welcomeBanner,
        {
          opacity: fadeAnim,
          top: insets.top + 10,
        },
      ]}
    >
      <Text style={styles.welcomeText}>👋 Welcome back, {name}!</Text>
    </Animated.View>
  );
};

export const RootNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role, isRestoringSession, showWelcomeBack, user, coach } = useSelector(
    (state: RootState) => state.auth as any
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isRestoringSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) {
    return <AuthNavigator />;
  }

  const userName = user?.name || coach?.name || 'User';

  return (
    <View style={{ flex: 1 }}>
      {showWelcomeBack && <WelcomeBanner name={userName} />}
      {role === 'coach' ? <CoachTabNavigator /> : <ClientTabNavigator />}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  welcomeBanner: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 999,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  welcomeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});