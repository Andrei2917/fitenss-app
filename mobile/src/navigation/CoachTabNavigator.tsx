import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LiquidGlassTabBar from '../components/navigation/LiquidGlassTabBar';

import { ForumStackNavigator } from './ForumStackNavigator';
import CoachDashboardScreen from '../screens/coach/CoachDashboardScreen';
import VideoVaultScreen from '../screens/coach/VideoVaultScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditCoachProfileScreen from '../screens/coach/EditCoachProfileScreen';
import ConversationsScreen from '../screens/messaging/ConversationsScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import { colors } from '../constants/colors';

// Coach Profile Stack (settings + edit public profile)
const CoachProfileStack = createNativeStackNavigator();
const CoachProfileStackNavigator = () => (
  <CoachProfileStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <CoachProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Settings' }} />
    <CoachProfileStack.Screen name="EditCoachProfile" component={EditCoachProfileScreen} options={{ title: 'Edit Public Profile' }} />
  </CoachProfileStack.Navigator>
);

// Messages Stack
const MessagesStack = createNativeStackNavigator();
const MessagesStackNavigator = () => (
  <MessagesStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <MessagesStack.Screen name="ConversationsList" component={ConversationsScreen} options={{ title: 'Messages' }} />
    <MessagesStack.Screen name="Chat" component={ChatScreen} options={({ route }: any) => ({ title: route.params.coachName || 'Chat' })} />
  </MessagesStack.Navigator>
);

const Tab = createBottomTabNavigator();

const COACH_TABS = [
  { name: 'HomeTab',       label: 'Home',       icon: 'home-outline' as const,        iconFocused: 'home' as const },
  { name: 'DashboardTab',  label: 'My Clients', icon: 'people-outline' as const,      iconFocused: 'people' as const },
  { name: 'VideoVaultTab', label: 'Videos',     icon: 'videocam-outline' as const,    iconFocused: 'videocam' as const },
  { name: 'MessagesTab',   label: 'Messages',   icon: 'chatbubbles-outline' as const, iconFocused: 'chatbubbles' as const },
  { name: 'ProfileTab',    label: 'Settings',   icon: 'settings-outline' as const,    iconFocused: 'settings' as const },
];

const CoachTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidGlassTabBar {...props} tabs={COACH_TABS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={ForumStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="DashboardTab" component={CoachDashboardScreen} options={{ title: 'My Clients', headerShown: true, headerTitle: 'Coach Dashboard' }} />
      <Tab.Screen name="VideoVaultTab" component={VideoVaultScreen} options={{ title: 'Video Vault', headerShown: true, headerTitle: 'Video Vault' }} />
      <Tab.Screen name="MessagesTab" component={MessagesStackNavigator} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={CoachProfileStackNavigator} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default CoachTabNavigator;