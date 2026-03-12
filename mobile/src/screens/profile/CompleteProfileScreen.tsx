import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '../../store';
import { clientProfileApi } from '../../services/api/profileApi';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

const GOALS = [
  { id: 'athletic', label: '🏋️ Be More Athletic', icon: 'fitness-outline' },
  { id: 'lose_weight', label: '⬇️ Lose Weight', icon: 'trending-down-outline' },
  { id: 'gain_weight', label: '⬆️ Gain Weight', icon: 'trending-up-outline' },
  { id: 'build_muscle', label: '💪 Build Muscle', icon: 'barbell-outline' },
  { id: 'flexibility', label: '🧘 Improve Flexibility', icon: 'body-outline' },
  { id: 'endurance', label: '🏃 Boost Endurance', icon: 'walk-outline' },
  { id: 'health', label: '❤️ General Health', icon: 'heart-outline' },
  { id: 'stress', label: '🧠 Reduce Stress', icon: 'happy-outline' },
];

const CompleteProfileScreen = ({ navigation }: any) => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const userId = authState?.user?.id;

  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const getCompletion = () => {
    let filled = 0;
    const total = 5;
    if (sex) filled++;
    if (age.trim()) filled++;
    if (height.trim()) filled++;
    if (weight.trim()) filled++;
    if (selectedGoals.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    if (!sex || !age.trim() || !height.trim() || !weight.trim() || selectedGoals.length === 0) {
      Alert.alert('Incomplete', 'Please fill out all fields and select at least one goal.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'Could not find your user ID. Please log in again.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save to backend database
      await clientProfileApi.saveProfile(userId, {
        sex,
        age,
        height,
        weight,
        goals: selectedGoals,
      });

      // 2. Mark profile as completed in local storage (for the banner)
      await SecureStore.setItemAsync('profile_completed', 'true');

      // 3. Show success and go back
      Alert.alert(
        'Profile Saved! ✅',
        'Your preferences have been saved. We\'ll use this to personalize your experience soon!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const completion = getCompletion();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* PROGRESS DIAL */}
        <View style={styles.dialSection}>
          <View style={styles.dialOuter}>
            <View style={[styles.dialInner, { borderColor: completion === 100 ? colors.success : colors.primary }]}>
              <Text style={styles.dialPercent}>{completion}%</Text>
              <Text style={styles.dialLabel}>Complete</Text>
            </View>
          </View>
          <Text style={styles.dialTitle}>Complete Your Profile</Text>
          <Text style={styles.dialSubtitle}>Help us personalize your fitness journey</Text>
        </View>

        {/* SEX SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sex</Text>
          <View style={styles.sexRow}>
            <TouchableOpacity
              style={[styles.sexButton, sex === 'male' && styles.sexButtonActive]}
              onPress={() => setSex('male')}
            >
              <Ionicons name="male" size={24} color={sex === 'male' ? colors.white : colors.primary} />
              <Text style={[styles.sexText, sex === 'male' && styles.sexTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexButton, sex === 'female' && styles.sexButtonActive]}
              onPress={() => setSex('female')}
            >
              <Ionicons name="female" size={24} color={sex === 'female' ? colors.white : colors.primary} />
              <Text style={[styles.sexText, sex === 'female' && styles.sexTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AGE, HEIGHT, WEIGHT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Age</Text>
              <TextInput
                style={styles.metricInput}
                placeholder="25"
                placeholderTextColor="#ccc"
                keyboardType="number-pad"
                returnKeyType="done"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
              <Text style={styles.metricUnit}>years</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Height</Text>
              <TextInput
                style={styles.metricInput}
                placeholder="175"
                placeholderTextColor="#ccc"
                keyboardType="number-pad"
                returnKeyType="done"
                value={height}
                onChangeText={setHeight}
                maxLength={3}
              />
              <Text style={styles.metricUnit}>cm</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Weight</Text>
              <TextInput
                style={styles.metricInput}
                placeholder="70"
                placeholderTextColor="#ccc"
                keyboardType="number-pad"
                returnKeyType="done"
                value={weight}
                onChangeText={setWeight}
                maxLength={3}
              />
              <Text style={styles.metricUnit}>kg</Text>
            </View>
          </View>
        </View>

        {/* GOALS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you want from the app?</Text>
          <Text style={styles.goalSubtitle}>Select all that apply</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalChip, isSelected && styles.goalChipActive]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Text style={[styles.goalText, isSelected && styles.goalTextActive]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Dial
  dialSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dialOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accentIce, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  dialInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 4 },
  dialPercent: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  dialLabel: { fontSize: 11, color: colors.textLight, marginTop: -2 },
  dialTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  dialSubtitle: { fontSize: 14, color: colors.textLight, marginTop: 4 },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },

  // Sex
  sexRow: { flexDirection: 'row', gap: 15 },
  sexButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.border },
  sexButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sexText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  sexTextActive: { color: colors.white },

  // Metrics
  metricsRow: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  metricLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricInput: { fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center', width: '100%', paddingVertical: 8 },
  metricUnit: { fontSize: 12, color: colors.textLight, marginTop: 4 },

  // Goals
  goalSubtitle: { fontSize: 13, color: colors.textLight, marginBottom: 12, marginTop: -6 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 25, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  goalChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  goalText: { fontSize: 14, fontWeight: '600', color: colors.text },
  goalTextActive: { color: colors.white },

  // Save
  saveButton: { backgroundColor: colors.primary, marginHorizontal: 20, marginTop: 30, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveText: { color: colors.white, fontSize: 17, fontWeight: 'bold' },
});

export default CompleteProfileScreen;