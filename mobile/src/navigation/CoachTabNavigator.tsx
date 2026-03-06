import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // <-- NEW: Import the premium icons!

import { ForumStackNavigator } from './ForumStackNavigator';
import CoachDashboardScreen from '../screens/coach/CoachDashboardScreen';
import VideoVaultScreen from '../screens/coach/VideoVaultScreen';
import ProfileScreen from '../screens/profile/ProfileScreen'; // Uses the exact same profile page!
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const CoachTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false, 
        
        // --- NEW: Dynamic Icon Injection ---
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle'; // Fallback icon

          if (route.name === 'CommunityTab') {
            // Chat bubbles for the forum
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'DashboardTab') {
            // A group of people for the client roster
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'VideoVaultTab') {
            // A video camera for the video uploads
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'ProfileTab') {
            // A human silhouette for the profile/settings
            iconName = focused ? 'person' : 'person-outline';
          }

          // Returns the perfectly sized and colored icon
          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
        
        // Polish the tab bar spacing so it doesn't look cramped
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      {/* TAB 1: COMMUNITY (Coach version hides the search bar automatically) */}
      <Tab.Screen 
        name="CommunityTab" 
        component={ForumStackNavigator} 
        options={{ title: 'Community' }} 
      />
      
      {/* TAB 2: DASHBOARD (Clients + Access Codes) */}
      <Tab.Screen 
        name="DashboardTab" 
        component={CoachDashboardScreen} 
        options={{ title: 'My Clients', headerShown: true, headerTitle: 'Coach Dashboard' }} 
      />

      {/* TAB 3: VIDEO VAULT (Uploads) */}
      <Tab.Screen 
        name="VideoVaultTab" 
        component={VideoVaultScreen} 
        options={{ title: 'Video Vault', headerShown: true, headerTitle: 'Video Vault' }} 
      />

      {/* TAB 4: PROFILE & LOGOUT */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default CoachTabNavigator;