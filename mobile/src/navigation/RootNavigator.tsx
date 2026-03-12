import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import ClientTabNavigator from './ClientTabNavigator';
import CoachTabNavigator from './CoachTabNavigator';
import { RootState, AppDispatch } from '../store';
import { restoreSession, dismissWelcomeBack } from '../store/slices/authSlice';
import { colors } from '../constants/colors';

const WelcomeBanner = ({ name }: { name: string }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // After 3 seconds, fade out then dismiss
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
    <Animated.View style={[styles.welcomeBanner, { opacity: fadeAnim }]}>
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

  // Show a loading spinner while checking SecureStore
  if (isRestoringSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not logged in
  if (!token) {
    return <AuthNavigator />;
  }

  const userName = user?.name || coach?.name || 'User';

  // Logged in
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
    top: 50,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
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
  },
});