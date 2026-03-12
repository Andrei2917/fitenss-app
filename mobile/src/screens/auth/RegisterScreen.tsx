import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { AuthRoutes, RootStackParamList } from '../../navigation/routes';
import { registerUser, registerCoach } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, AuthRoutes.REGISTER>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCoach, setIsCoach] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all basic fields.');
      return;
    }
    if (isCoach && !specialty) {
      Alert.alert('Error', 'Coaches must provide a specialty (e.g., Yoga, Powerlifting).');
      return;
    }

    setIsLoading(true);
    try {
      if (isCoach) {
        await dispatch(registerCoach({ name, email, password, specialty })).unwrap();
        Alert.alert('Welcome!', 'Your Coach account has been created.');
      } else {
        await dispatch(registerUser({ name, email, password })).unwrap();
        // After client registration, show the Complete Profile popup
        Alert.alert(
          '🎉 Welcome!',
          'Your account has been created! Would you like to complete your profile now?',
          [
            { text: 'Skip for now', style: 'cancel' },
            { text: 'Complete Profile', onPress: () => {
              // This will be handled once they're logged in — the navigation 
              // will auto-switch to ClientTabNavigator, which has CompleteProfile in its stack
            }},
          ]
        );
      }
    } catch (error) {
      Alert.alert('Registration Failed', error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollGrow} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us and get closer to your goals.</Text>
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, !isCoach && styles.toggleButtonActive]} onPress={() => setIsCoach(false)}>
                <Text style={[styles.toggleText, !isCoach && styles.toggleTextActive]}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, isCoach && styles.toggleButtonActive]} onPress={() => setIsCoach(true)}>
                <Text style={[styles.toggleText, isCoach && styles.toggleTextActive]}>Coach</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Input label="Full Name" placeholder="e.g. John Doe" autoCapitalize="words" value={name} onChangeText={setName} />
              <Input label="Email Address" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              
              {isCoach && (
                <Input label="Specialty" placeholder="e.g. Yoga, Weightlifting" autoCapitalize="words" value={specialty} onChangeText={setSpecialty} />
              )}

              <Input label="Password" placeholder="Create a strong password" secureTextEntry value={password} onChangeText={setPassword} />

              <Button title={`Sign Up as ${isCoach ? 'Coach' : 'Client'}`} onPress={handleRegister} isLoading={isLoading} style={styles.registerButton} />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollGrow: { flexGrow: 1 },
  inner: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center' },
  headerContainer: { marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.size.xxl, fontWeight: theme.typography.weight.bold, color: colors.primary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.size.md, color: colors.textLight },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: theme.borderRadius.md, padding: 4, marginBottom: theme.spacing.xl },
  toggleButton: { flex: 1, paddingVertical: theme.spacing.sm, alignItems: 'center', borderRadius: theme.borderRadius.sm },
  toggleButtonActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium, color: colors.textLight },
  toggleTextActive: { color: colors.primary, fontWeight: theme.typography.weight.bold },

  formContainer: { marginBottom: theme.spacing.xl },
  registerButton: { marginTop: theme.spacing.md },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: theme.spacing.xl },
  footerText: { fontSize: theme.typography.size.sm, color: colors.textLight },
  footerLink: { fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.bold, color: colors.primary },
});

export default RegisterScreen;