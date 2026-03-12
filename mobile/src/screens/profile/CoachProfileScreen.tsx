import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { coachApi } from '../../services/api/coachApi';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface CoachProfileProps {
  route: {
    params: {
      coachId: string;
      coachName: string;
      specialty: string;
      bio?: string;
      profilePictureUrl?: string;
    };
  };
  navigation: any;
}

const CoachProfileScreen = ({ route, navigation }: CoachProfileProps) => {
  const { coachId, coachName, specialty, bio, profilePictureUrl } = route.params;
  const authState = useSelector((state: RootState) => state.auth as any);
  const userId = authState?.user?.id;
  const isCoach = authState?.role === 'coach';

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await coachApi.getCoachProfile(coachId);
      setProfileData(profile);

      if (userId && !isCoach) {
        const subStatus = await coachApi.checkSubscription(coachId, userId);
        setIsSubscribed(subStatus);
      }
    } catch (error) {
      // Use route params as fallback
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const displayBio = profileData?.bio || bio || `${specialty} coach, here to help you reach your fitness goals. Training, motivation, and results. 💪`;
  const displayTagline = profileData?.tagline;
  const displayCover = profileData?.coverImageUrl || profilePictureUrl;
  const displayAvatar = profileData?.profilePictureUrl || profilePictureUrl;
  const displayPrice = profileData?.subscriptionPrice || 19.99;

  // Parse offerings JSON
  let offerings: string[] = [];
  try {
    if (profileData?.offerings) {
      offerings = JSON.parse(profileData.offerings);
    }
  } catch {}

  const handleMessage = () => {
    if (isCoach) {
      Alert.alert('Not Available', 'Messaging is for clients only.');
      return;
    }
    if (!isSubscribed) {
      Alert.alert('Subscribe First', 'You need an active subscription with this coach to send messages.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: handleSubscribe },
      ]);
      return;
    }
    navigation.navigate('Chat', { coachId, coachName, userId });
  };

  const handleSubscribe = () => {
    if (isCoach) {
      Alert.alert('Not Available', 'Coaches cannot subscribe to other coaches.');
      return;
    }
    // Navigate to Training/Courses tab with this coach pre-selected
    navigation.navigate('TrainingTab', {
      screen: 'TrainingScreen',
      params: { directPurchaseCoachId: coachId, directPurchaseCoachName: coachName },
    });
  };

  const ActionButton = ({ icon, label, onPress, disabled }: { icon: string; label: string; onPress?: () => void; disabled?: boolean }) => (
    <TouchableOpacity style={[styles.actionBtn, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <View style={styles.actionIconCircle}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* COVER PHOTO */}
      <View style={styles.coverContainer}>
        {displayCover ? (
          <Image source={{ uri: displayCover }} style={styles.coverImage} blurRadius={3} />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: colors.primary }]} />
        )}
        <View style={styles.coverOverlay} />
      </View>

      {/* PROFILE INFO */}
      <View style={styles.profileSection}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{coachName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        {/* Name + Verified badge */}
        <View style={styles.nameRow}>
          <Text style={styles.coachName}>{coachName}</Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        </View>

        <Text style={styles.handle}>@{coachName.toLowerCase().replace(/\s/g, '')}  ·  Available now</Text>

        {/* Tagline */}
        {displayTagline && <Text style={styles.tagline}>{displayTagline}</Text>}

        {/* Bio */}
        <Text style={styles.bio}>{displayBio}</Text>

        {/* Price badge */}
        <View style={styles.priceBadge}>
          <Ionicons name="pricetag" size={14} color={colors.white} />
          <Text style={styles.priceText}>${displayPrice}/month</Text>
        </View>

        {/* ACTION BUTTONS ROW (no social media!) */}
        <View style={styles.actionsRow}>
          <ActionButton 
            icon="chatbubble-outline" 
            label="Message" 
            onPress={handleMessage}
            disabled={isCheckingSubscription}
          />
          <ActionButton 
            icon="card-outline" 
            label="Subscribe" 
            onPress={handleSubscribe}
          />
          <ActionButton icon="star-outline" label="Favorite" onPress={() => Alert.alert('Coming Soon', 'Favorites are coming soon!')} />
          <ActionButton icon="share-social-outline" label="Share" onPress={() => Alert.alert('Coming Soon', 'Sharing is coming soon!')} />
        </View>

        {/* Subscription status */}
        {!isCoach && (
          <View style={[styles.statusBadge, isSubscribed ? styles.statusActive : styles.statusInactive]}>
            <Ionicons 
              name={isSubscribed ? 'checkmark-circle' : 'lock-closed'} 
              size={16} 
              color={isSubscribed ? colors.success : colors.textLight} 
            />
            <Text style={[styles.statusText, isSubscribed && { color: colors.success }]}>
              {isSubscribed ? 'Subscribed — Full Access' : 'Not subscribed yet'}
            </Text>
          </View>
        )}

        {/* ABOUT SECTION */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>What I Offer</Text>
          
          <View style={styles.offerCard}>
            <Ionicons name="fitness-outline" size={24} color={colors.primary} />
            <View style={styles.offerTextBlock}>
              <Text style={styles.offerTitle}>Specialty: {specialty}</Text>
              <Text style={styles.offerDesc}>Personalized training plans tailored to your specific goals and fitness level.</Text>
            </View>
          </View>

          <View style={styles.offerCard}>
            <Ionicons name="nutrition-outline" size={24} color={colors.primary} />
            <View style={styles.offerTextBlock}>
              <Text style={styles.offerTitle}>Nutrition Guidance</Text>
              <Text style={styles.offerDesc}>Macro-based meal plans and nutritional advice to fuel your progress.</Text>
            </View>
          </View>

          <View style={styles.offerCard}>
            <Ionicons name="videocam-outline" size={24} color={colors.primary} />
            <View style={styles.offerTextBlock}>
              <Text style={styles.offerTitle}>Video Courses</Text>
              <Text style={styles.offerDesc}>Access to exclusive training videos with full workout demonstrations.</Text>
            </View>
          </View>

          <View style={styles.offerCard}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
            <View style={styles.offerTextBlock}>
              <Text style={styles.offerTitle}>Direct Support</Text>
              <Text style={styles.offerDesc}>1-on-1 communication for accountability, form checks, and motivation.</Text>
            </View>
          </View>

          {/* Custom offerings from coach settings */}
          {offerings.map((item, index) => (
            <View key={index} style={styles.offerCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
              <View style={styles.offerTextBlock}>
                <Text style={styles.offerTitle}>{item}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  coverContainer: { width, height: 200, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.15)' },

  profileSection: { alignItems: 'center', marginTop: -50, paddingHorizontal: 20 },

  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.white },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.white, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontSize: 40, fontWeight: 'bold' },
  onlineDot: { position: 'absolute', bottom: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CAF50', borderWidth: 3, borderColor: colors.white },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  coachName: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  handle: { fontSize: 14, color: colors.textLight, marginTop: 2, marginBottom: 6 },
  tagline: { fontSize: 16, fontStyle: 'italic', color: colors.secondary, textAlign: 'center', marginBottom: 8 },
  bio: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 12 },

  priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  priceText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  actionsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.accentIce, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 20 },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusInactive: { backgroundColor: '#f5f5f5' },
  statusText: { fontSize: 13, fontWeight: '600', color: colors.textLight },

  aboutSection: { width: '100%', marginTop: 10 },
  aboutTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  offerCard: { flexDirection: 'row', gap: 14, backgroundColor: colors.white, padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'flex-start' },
  offerTextBlock: { flex: 1 },
  offerTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 3 },
  offerDesc: { fontSize: 13, color: colors.textLight, lineHeight: 19 },
});

export default CoachProfileScreen;