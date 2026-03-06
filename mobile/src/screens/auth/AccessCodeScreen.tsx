import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { subscriptionApi } from '../../services/api/coachApi'; // Adjust path if needed!
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const AccessCodeScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    if (code.length < 5) {
      return Alert.alert('Invalid Code', 'Please enter a valid access code.');
    }
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await subscriptionApi.redeemCode(user.id, code);
      Alert.alert('Success!', 'You are now linked to your coach!');
      setCode('');
      
      // Instantly switch them over to the Training tab to see the Paywall!
      navigation.navigate('Training');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Link Your Coach</Text>
        <Text style={styles.subtitle}>
          Enter the unique access code provided by your fitness coach to unlock your premium training plan.
        </Text>

        <Input
          label="Access Code"
          placeholder="e.g. 1A2B3C"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <Button 
            title="Redeem Code" 
            onPress={handleRedeem} 
            disabled={code.length === 0} 
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg, justifyContent: 'center' },
  card: { backgroundColor: colors.white, padding: theme.spacing.xl, borderRadius: theme.borderRadius.lg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 30, lineHeight: 20 },
});

export default AccessCodeScreen;