import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { profileApi } from '../../services/api/authApi';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState.user || authState.coach;
  const role = authState.role || (authState.coach ? 'coach' : 'client');

  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const newUrl = await profileApi.uploadAvatar(user.id, role, result.assets[0].uri);
        dispatch({ type: 'auth/updateProfilePicture', payload: newUrl });
        Alert.alert('Success', 'Profile picture updated!');
      } catch (e: any) {
        Alert.alert('Upload failed', e.message);
      } finally { setUploading(false); }
    }
  };

  const coming = (f: string) => Alert.alert('Coming Soon', `${f} is under development.`);

  type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

  const Row = ({ icon, label, onPress, danger = false }: { icon: IoniconName; label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[S.rowIcon, danger && S.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#EF4444' : '#21277B'} />
      </View>
      <Text style={[S.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
    </TouchableOpacity>
  );

  const Divider = () => <View style={S.divider} />;

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero header */}
        <LinearGradient colors={['#21277B', '#2E3596']} style={S.hero}>
          <TouchableOpacity style={S.avatarBtn} onPress={handlePickImage} disabled={uploading} activeOpacity={0.85}>
            {user?.profilePictureUrl
              ? <Image source={{ uri: user.profilePictureUrl }} style={S.avatar} />
              : (
                <View style={S.avatarPlaceholder}>
                  <Text style={S.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
              )
            }
            {uploading
              ? <View style={S.avatarOverlay}><ActivityIndicator color="#fff" size="small" /></View>
              : (
                <View style={S.cameraBadge}>
                  <Ionicons name="camera" size={14} color="#21277B" />
                </View>
              )
            }
          </TouchableOpacity>

          <Text style={S.heroName}>{user?.name || 'My Account'}</Text>
          <Text style={S.heroEmail}>{user?.email}</Text>
          <View style={S.rolePill}>
            <Text style={S.roleText}>{role.toUpperCase()}</Text>
          </View>
          <View style={S.heroCurve} />
        </LinearGradient>

        <View style={S.body}>
          {/* Quick action card */}
          {role === 'client' && (
            <TouchableOpacity style={S.actionCard} onPress={() => navigation.navigate('CompleteProfile')} activeOpacity={0.88}>
              <LinearGradient colors={['#EEF1FF', '#E8EAFF']} style={S.actionGrad}>
                <View style={S.actionIcon}>
                  <Ionicons name="person-add-outline" size={22} color="#21277B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.actionTitle}>Complete Your Profile</Text>
                  <Text style={S.actionSub}>Set goals, body metrics & preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#21277B" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          {role === 'coach' && (
            <TouchableOpacity style={S.actionCard} onPress={() => navigation.navigate('EditCoachProfile')} activeOpacity={0.88}>
              <LinearGradient colors={['#EEF1FF', '#E8EAFF']} style={S.actionGrad}>
                <View style={S.actionIcon}>
                  <Ionicons name="create-outline" size={22} color="#21277B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.actionTitle}>Edit Public Profile</Text>
                  <Text style={S.actionSub}>Bio, tagline, offerings & pricing</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#21277B" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Account */}
          <Text style={S.sectionLabel}>ACCOUNT</Text>
          <View style={S.card}>
            <Row icon="person-outline" label="Personal Information" onPress={() => coming('Personal Info')} />
            <Divider />
            <Row icon="call-outline" label="Phone Number" onPress={() => coming('Phone Number')} />
            <Divider />
            <Row icon="lock-closed-outline" label="Change Password" onPress={() => coming('Change Password')} />
          </View>

          {/* Billing */}
          <Text style={S.sectionLabel}>BILLING</Text>
          <View style={S.card}>
            <Row icon="card-outline" label="Payment Methods" onPress={() => coming('Payment Methods')} />
            <Divider />
            <Row icon="receipt-outline" label="Billing History" onPress={() => coming('Billing History')} />
          </View>

          {/* Preferences */}
          <Text style={S.sectionLabel}>PREFERENCES</Text>
          <View style={S.card}>
            <Row icon="notifications-outline" label="Push Notifications" onPress={() => coming('Notifications')} />
            <Divider />
            <Row icon="help-circle-outline" label="Help & Support" onPress={() => coming('Support')} />
          </View>

          {/* Logout */}
          <View style={[S.card, { marginTop: 8 }]}>
            <Row icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
          </View>

          <Text style={S.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },

  hero: { paddingTop: 60, paddingBottom: 48, alignItems: 'center' },
  avatarBtn: { position: 'relative', marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarInitial: { fontSize: 34, fontWeight: '800', color: '#fff' },
  avatarOverlay: { position: 'absolute', inset: 0, borderRadius: 44, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#21277B' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  rolePill: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  roleText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.2 },
  heroCurve: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 22, backgroundColor: '#F2F4FA', borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  body: { paddingHorizontal: 16, paddingTop: 8 },

  actionCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, ...CARD_SHADOW },
  actionGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#DADEFD' },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 }, android: { elevation: 2 } }) },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#21277B' },
  actionSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, marginTop: 4, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, overflow: 'hidden', ...CARD_SHADOW },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF1FF', justifyContent: 'center', alignItems: 'center' },
  rowIconDanger: { backgroundColor: '#FEF2F2' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0D1117' },
  divider: { height: 1, backgroundColor: '#F2F4FA', marginLeft: 64 },

  version: { textAlign: 'center', color: '#C4C9D4', fontSize: 12, marginTop: 8 },
});
