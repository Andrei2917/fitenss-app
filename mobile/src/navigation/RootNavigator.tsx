import React from 'react';
import { useSelector } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import ClientTabNavigator from './ClientTabNavigator'; // <-- Imported Client Tabs
import  CoachTabNavigator  from './CoachTabNavigator'; // <-- Imported Coach Tabs
import { RootState } from '../store';

export const RootNavigator = () => {
  // Grab the token AND the role from our Redux store
  const { token, role } = useSelector((state: RootState) => state.auth);

  // 1. If there is no token, they are not logged in. Show the Auth screens.
  if (!token) {
    return <AuthNavigator />;
  }

  // 2. If they have a token, check their role.
  if (role === 'coach') {
    return <CoachTabNavigator />;
  }

  // 3. If they are a client (or for some reason the role is missing but they have a token), default to Client Tabs.
  return <ClientTabNavigator />;
};