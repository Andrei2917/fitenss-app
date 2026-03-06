import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { AuthRoutes, RootStackParamList } from '../../navigation/routes';
import { loginUser, loginCoach } from '../../store/slices/authSlice'; // <-- Imported both!
import { AppDispatch } from '../../store';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, AuthRoutes.LOGIN>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCoach, setIsCoach] = useState(false); // <-- The Magic Toggle State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Check the toggle to decide which route to hit!
      if (isCoach) {
        await dispatch(loginCoach({ email, password })).unwrap();
      } else {
        await dispatch(loginUser({ email, password })).unwrap();
      }
      
      Alert.alert('Success!', `Logged in as a ${isCoach ? 'Coach' : 'Client'}.`);
    } catch (error) {
      Alert.alert('Login Failed', error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue your fitness journey.</Text>
          </View>

          {/* --- THE ROLE TOGGLE --- */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, !isCoach && styles.toggleButtonActive]} 
              onPress={() => setIsCoach(false)}
            >
              <Text style={[styles.toggleText, !isCoach && styles.toggleTextActive]}>Client</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toggleButton, isCoach && styles.toggleButtonActive]} 
              onPress={() => setIsCoach(true)}
            >
              <Text style={[styles.toggleText, isCoach && styles.toggleTextActive]}>Coach</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Input 
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            <Input 
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button 
              title={`Log In as ${isCoach ? 'Coach' : 'Client'}`} 
              onPress={handleLogin} 
              isLoading={isLoading} 
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(AuthRoutes.REGISTER)}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center' },
  headerContainer: { marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.size.xxl, fontWeight: theme.typography.weight.bold, color: colors.primary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.size.md, color: colors.textLight },
  
  // Toggle Styles
  toggleContainer: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: theme.borderRadius.md, padding: 4, marginBottom: theme.spacing.xl },
  toggleButton: { flex: 1, paddingVertical: theme.spacing.sm, alignItems: 'center', borderRadius: theme.borderRadius.sm },
  toggleButtonActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium, color: colors.textLight },
  toggleTextActive: { color: colors.primary, fontWeight: theme.typography.weight.bold },
  
  formContainer: { marginBottom: theme.spacing.xl },
  loginButton: { marginTop: theme.spacing.md },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: theme.typography.size.sm, color: colors.textLight },
  footerLink: { fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.bold, color: colors.primary },
});

export default LoginScreen;