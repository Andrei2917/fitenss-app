import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ForumStackNavigator } from './ForumStackNavigator';
import TrainingScreen from '../screens/tabs/TrainingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CompleteProfileScreen from '../screens/profile/CompleteProfileScreen';
import { colors } from '../constants/colors';

// Wrap ProfileScreen in its own stack so it can navigate to CompleteProfile
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
            // Home icon instead of chat bubbles
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TrainingTab') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
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
      <Tab.Screen 
        name="HomeTab" 
        component={ForumStackNavigator} 
        options={{ title: 'Home' }}  // <-- RENAMED from 'Community'
      />
      <Tab.Screen 
        name="TrainingTab" 
        component={TrainingScreen} 
        options={{ title: 'Courses', headerShown: true, headerTitle: 'My Courses' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator} 
        options={{ title: 'Settings' }}  // <-- RENAMED from 'Profile'
      />
    </Tab.Navigator>
  );
};

export default ClientTabNavigator;