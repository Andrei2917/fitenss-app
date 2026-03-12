import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

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

// Training Stack
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

// =============================================
// Persistent "Complete Profile" floating banner
// =============================================
const CompleteProfileBanner = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(true); // assume complete by default
  const navigation = useNavigation<any>();

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    const completed = await SecureStore.getItemAsync('profile_completed');
    setIsProfileComplete(completed === 'true');
  };

  const handleDismiss = async () => {
    // Dismiss until next app open
    setIsProfileComplete(true);
  };

  if (isProfileComplete) return null;

  return (
    <TouchableOpacity
      style={bannerStyles.banner}
      onPress={() => navigation.navigate('ProfileTab', { screen: 'CompleteProfile' })}
    >
      <View style={bannerStyles.bannerLeft}>
        <Ionicons name="alert-circle" size={20} color={colors.white} />
        <Text style={bannerStyles.bannerText}>Complete setting up your informations</Text>
      </View>
      <TouchableOpacity onPress={handleDismiss}>
        <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ClientTabNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <CompleteProfileBanner />
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
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: '#e67e22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bannerText: { color: colors.white, fontSize: 13, fontWeight: '600', flex: 1 },
});

export default ClientTabNavigator;