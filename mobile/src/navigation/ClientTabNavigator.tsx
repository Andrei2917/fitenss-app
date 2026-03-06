import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // <-- NEW: Import the premium icons!

import { ForumStackNavigator } from './ForumStackNavigator';
import TrainingScreen from '../screens/tabs/TrainingScreen'; // <-- Fixed path!
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const ClientTabNavigator = () => {
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
          } else if (route.name === 'TrainingTab') {
            // A play button for the video courses
            iconName = focused ? 'play-circle' : 'play-circle-outline';
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
      <Tab.Screen 
        name="CommunityTab" 
        component={ForumStackNavigator} 
        options={{ title: 'Community' }} 
      />
      <Tab.Screen 
        name="TrainingTab" 
        component={TrainingScreen} 
        options={{ title: 'Courses', headerShown: true, headerTitle: 'My Courses' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default ClientTabNavigator; // <-- Ensures RootNavigator can read it!