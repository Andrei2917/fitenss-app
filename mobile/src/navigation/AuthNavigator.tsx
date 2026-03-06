import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthRoutes, RootStackParamList } from './routes';
import { colors } from '../constants/colors';

// We will create these visual screens in the next step!
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={AuthRoutes.LOGIN}
      screenOptions={{
        // This removes the default ugly gray header at the top of the phone
        headerShown: false, 
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name={AuthRoutes.LOGIN} 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name={AuthRoutes.REGISTER} 
        component={RegisterScreen} 
        // We can add a simple back button for the register screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false, // Makes the header blend into the background
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary, // Makes the back arrow your primary blue
        }}
      />
    </Stack.Navigator>
  );
};