import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForumListScreen from '../screens/forum/forumListScreen';
import PostDetailScreen from '../screens/forum/postDetailScreen';
import FindCoachScreen from '../screens/tabs/ExploreCoachesScreen';
import { colors } from '../constants/colors';

export type ForumStackParamList = {
  ForumList: undefined;
  PostDetail: { postId: string; title: string };
  FindCoach: undefined; // <-- ADD THIS
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
      <Stack.Screen 
        name="ForumList" 
        component={ForumListScreen} 
        options={{ title: 'Community' }} 
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen} 
        options={({ route }) => ({ title: route.params.title })} 
      />
      {/* ADD THIS SCREEN TO THE STACK */}
      <Stack.Screen 
        name="FindCoach" 
        component={FindCoachScreen} 
        options={{ title: 'Find a Coach' }} 
      />
    </Stack.Navigator>
  );
};