import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { coachApi } from '../../services/api/coachApi';
import { colors } from '../../constants/colors';

const EditCoachProfileScreen = ({ navigation }: any) => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const coach = authState.coach;

  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState('19.99');
  const [offerings, setOfferings] = useState<string[]>([]);
  const [newOffering, setNewOffering] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await coachApi.getCoachProfile(coach.id);
      setBio(profile.bio || '');
      setTagline(profile.tagline || '');
      setPrice(String(profile.subscriptionPrice || 19.99));
      try {
        const parsed = profile.offerings ? JSON.parse(profile.offerings) : [];
        setOfferings(parsed);
      } catch { setOfferings([]); }
    } catch (error) {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const addOffering = () => {
    if (!newOffering.trim()) return;
    setOfferings(prev => [...prev, newOffering.trim()]);
    setNewOffering('');
  };

  const removeOffering = (index: number) => {
    setOfferings(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await coachApi.updateCoachProfile(coach.id, {
        bio,
        tagline,
        offerings: JSON.stringify(offerings),
        subscriptionPrice: price,
      });
      Alert.alert('Saved! ✅', 'Your profile has been updated. Clients will see the changes immediately.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Edit Your Public Profile</Text>
      <Text style={styles.subheader}>This is what clients see when they visit your profile.</Text>

      {/* TAGLINE */}
      <View style={styles.section}>
        <Text style={styles.label}>Tagline</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Trainer, adventurer, and here to inspire..."
          value={tagline}
          onChangeText={setTagline}
          maxLength={100}
        />
      </View>

      {/* BIO */}
      <View style={styles.section}>
        <Text style={styles.label}>Bio / About Me</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell clients about your experience, philosophy, and what makes you unique..."
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{bio.length}/500</Text>
      </View>

      {/* MONTHLY PRICE */}
      <View style={styles.section}>
        <Text style={styles.label}>Monthly Subscription Price (USD)</Text>
        <View style={styles.priceRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="19.99"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <Text style={styles.perMonth}>/month</Text>
        </View>
      </View>

      {/* CUSTOM OFFERINGS */}
      <View style={styles.section}>
        <Text style={styles.label}>Custom Offerings</Text>
        <Text style={styles.helperText}>Add extra services you provide beyond the defaults.</Text>
        
        {offerings.map((item, index) => (
          <View key={index} style={styles.offeringRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.offeringText}>{item}</Text>
            <TouchableOpacity onPress={() => removeOffering(index)}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. Meal prep coaching"
            value={newOffering}
            onChangeText={setNewOffering}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addOffering}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  subheader: { fontSize: 14, color: colors.textLight, marginBottom: 25 },
  section: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  helperText: { fontSize: 12, color: colors.textLight, marginBottom: 10, marginTop: -4 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 12, fontSize: 15, marginBottom: 5 },
  textArea: { height: 120 },
  charCount: { fontSize: 11, color: colors.textLight, textAlign: 'right' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dollarSign: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  priceInput: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  perMonth: { fontSize: 14, color: colors.textLight },
  offeringRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  offeringText: { flex: 1, fontSize: 14, color: colors.text },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  addBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveText: { color: colors.white, fontSize: 17, fontWeight: 'bold' },
});

export default EditCoachProfileScreen;