import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

const CoachTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false, 
        
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DashboardTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'VideoVaultTab') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'MessagesTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
        
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
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