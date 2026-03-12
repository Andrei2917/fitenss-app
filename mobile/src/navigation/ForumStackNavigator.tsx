import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForumListScreen from '../screens/forum/forumListScreen';
import PostDetailScreen from '../screens/forum/postDetailScreen';
import FindCoachScreen from '../screens/tabs/ExploreCoachesScreen';
import CoachProfileScreen from '../screens/profile/CoachProfileScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import { colors } from '../constants/colors';

export type ForumStackParamList = {
  ForumList: undefined;
  PostDetail: { postId: string; title: string };
  FindCoach: undefined;
  CoachProfile: {
    coachId: string;
    coachName: string;
    specialty: string;
    bio?: string;
    profilePictureUrl?: string;
  };
  Chat: {
    coachId: string;
    coachName: string;
    userId: string;
  };
};

const Stack = createNativeStackNavigator<ForumStackParamList>();

export const ForumStackNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen name="ForumList" component={ForumListScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <Stack.Screen name="FindCoach" component={FindCoachScreen} options={{ title: 'Find a Coach' }} />
      <Stack.Screen name="CoachProfile" component={CoachProfileScreen} options={({ route }) => ({ title: route.params.coachName })} />
      <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.coachName })} />
    </Stack.Navigator>
  );
};