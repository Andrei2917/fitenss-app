import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ForumStackNavigator } from './ForumStackNavigator';
import CoachDashboardScreen from '../screens/coach/CoachDashboardScreen';
import VideoVaultScreen from '../screens/coach/VideoVaultScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../constants/colors';

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
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
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
        name="DashboardTab" 
        component={CoachDashboardScreen} 
        options={{ title: 'My Clients', headerShown: true, headerTitle: 'Coach Dashboard' }} 
      />
      <Tab.Screen 
        name="VideoVaultTab" 
        component={VideoVaultScreen} 
        options={{ title: 'Video Vault', headerShown: true, headerTitle: 'Video Vault' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default CoachTabNavigator;