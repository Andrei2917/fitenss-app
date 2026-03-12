import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ForumStackNavigator } from './ForumStackNavigator';
import TrainingScreen from '../screens/tabs/TrainingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CompleteProfileScreen from '../screens/profile/CompleteProfileScreen';
import ConversationsScreen from '../screens/messaging/ConversationsScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import { colors } from '../constants/colors';

// Profile Stack
const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Settings' }} />
    <ProfileStack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{ title: 'Complete Profile' }} />
  </ProfileStack.Navigator>
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
    <MessagesStack.Screen name="Chat" component={ChatScreen} options={({ route }: any) => ({ title: route.params.coachName })} />
  </MessagesStack.Navigator>
);

// Training Stack (to accept route params from CoachProfile)
const TrainingStack = createNativeStackNavigator();
const TrainingStackNavigator = () => (
  <TrainingStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <TrainingStack.Screen name="TrainingScreen" component={TrainingScreen} options={{ title: 'My Courses' }} />
  </TrainingStack.Navigator>
);

const Tab = createBottomTabNavigator();

const ClientTabNavigator = () => {
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
          } else if (route.name === 'TrainingTab') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
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
      <Tab.Screen name="TrainingTab" component={TrainingStackNavigator} options={{ title: 'Courses' }} />
      <Tab.Screen name="MessagesTab" component={MessagesStackNavigator} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default ClientTabNavigator;