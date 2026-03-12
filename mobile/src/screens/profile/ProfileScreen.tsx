import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { profileApi } from '../../services/api/authApi';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons'; 

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  
  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user || authState.coach;
  const role = authState.role || (authState.coach ? 'coach' : 'client');

  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `The ${feature} feature is currently under development!`);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const imageUri = result.assets[0].uri;
        const newUrl = await profileApi.uploadAvatar(user.id, role, imageUri);
        dispatch({ type: 'auth/updateProfilePicture', payload: newUrl }); 
        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Something went wrong.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const SettingsRow = ({ icon, title, onPress, color = colors.text }: any) => (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsRowLeft}>
        <Ionicons name={icon} size={22} color={color} style={styles.settingsIcon} />
        <Text style={[styles.settingsTitle, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. HEADER PROFILE SECTION */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
          <View style={styles.avatarContainer}>
            {user?.profilePictureUrl ? (
              <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
              </View>
            )}
            {isUploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{user?.name || 'My Account'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role.toUpperCase()}</Text>
        </View>
      </View>

      {/* COMPLETE YOUR PROFILE (only for clients) */}
      {role === 'client' && (
        <TouchableOpacity
          style={styles.completeProfileCard}
          onPress={() => navigation.navigate('CompleteProfile')}
        >
          <View style={styles.completeProfileLeft}>
            <View style={styles.miniDial}>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.completeProfileTitle}>Complete Your Profile</Text>
              <Text style={styles.completeProfileSubtitle}>
                Set your goals, body metrics & preferences
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
        </TouchableOpacity>
      )}

      {/* EDIT PUBLIC PROFILE (only for coaches) */}
      {role === 'coach' && (
        <TouchableOpacity
          style={styles.completeProfileCard}
          onPress={() => navigation.navigate('EditCoachProfile')}
        >
          <View style={styles.completeProfileLeft}>
            <View style={styles.miniDial}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.completeProfileTitle}>Edit Public Profile</Text>
              <Text style={styles.completeProfileSubtitle}>
                Bio, tagline, offerings & pricing
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
        </TouchableOpacity>
      )}

      {/* 2. ACCOUNT SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="person-outline" title="Personal Information" onPress={() => handleComingSoon('Personal Info')} />
          <View style={styles.divider} />
          <SettingsRow icon="call-outline" title="Phone Number" onPress={() => handleComingSoon('Phone Number')} />
          <View style={styles.divider} />
          <SettingsRow icon="lock-closed-outline" title="Change Password" onPress={() => handleComingSoon('Change Password')} />
        </View>
      </View>

      {/* 3. BILLING & PAYMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing & Subscriptions</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="card-outline" title="Payment Methods" onPress={() => handleComingSoon('Payment Methods')} />
          <View style={styles.divider} />
          <SettingsRow icon="receipt-outline" title="Billing History" onPress={() => handleComingSoon('Billing History')} />
        </View>
      </View>

      {/* 4. PREFERENCES & LOGOUT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="notifications-outline" title="Push Notifications" onPress={() => handleComingSoon('Notifications')} />
          <View style={styles.divider} />
          <SettingsRow icon="help-circle-outline" title="Help & Support" onPress={() => handleComingSoon('Support')} />
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error || '#e74c3c'} style={styles.settingsIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>App Version 1.0.0</Text>
      <View style={{ height: 40 }} />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerCard: { backgroundColor: colors.white, padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarText: { color: colors.white, fontSize: 36, fontWeight: 'bold' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  email: { fontSize: 16, color: colors.textLight, marginBottom: 15 },
  badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: colors.textLight, letterSpacing: 1 },

  // Complete Profile Card
  completeProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f0fe',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  completeProfileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  miniDial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completeProfileTitle: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
  completeProfileSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 2 },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textLight, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5, marginLeft: 5 },
  sectionCard: { backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsIcon: { marginRight: 15 },
  settingsTitle: { fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginLeft: 55 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ffebee', marginTop: 10, marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: colors.error || '#e74c3c' },
  versionText: { textAlign: 'center', color: colors.textLight, fontSize: 12 },
});

export default ProfileScreen;