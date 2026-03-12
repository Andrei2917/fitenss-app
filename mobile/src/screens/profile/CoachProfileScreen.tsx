import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

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
}

const CoachProfileScreen = ({ route }: CoachProfileProps) => {
  const { coachId, coachName, specialty, bio, profilePictureUrl } = route.params;

  // Action buttons (like the OF icons row)
  const ActionButton = ({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={styles.actionIconCircle}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Social media link button
  const SocialButton = ({ icon, label, color, url }: { icon: string; label: string; color: string; url?: string }) => (
    <TouchableOpacity
      style={[styles.socialBtn, { backgroundColor: color }]}
      onPress={() => url && Linking.openURL(url)}
    >
      <Ionicons name={icon as any} size={18} color={colors.white} />
      <Text style={styles.socialText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* COVER PHOTO (uses profile pic as cover with blur effect) */}
      <View style={styles.coverContainer}>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.coverImage} blurRadius={3} />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: colors.primary }]} />
        )}
        {/* Gradient overlay */}
        <View style={styles.coverOverlay} />
      </View>

      {/* PROFILE INFO SECTION (overlaps cover) */}
      <View style={styles.profileSection}>
        {/* Avatar (overlapping the cover) */}
        <View style={styles.avatarWrapper}>
          {profilePictureUrl ? (
            <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{coachName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          {/* Online indicator */}
          <View style={styles.onlineDot} />
        </View>

        {/* Stats row (like OF: posts, likes, fans) */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="videocam" size={14} color={colors.primary} />
            <Text style={styles.statText}>Videos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>Top Coach</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={styles.statText}>Clients</Text>
          </View>
        </View>

        {/* Name + Verified badge */}
        <View style={styles.nameRow}>
          <Text style={styles.coachName}>{coachName}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.handle}>@{coachName.toLowerCase().replace(/\s/g, '')}  ·  Available now</Text>

        {/* Bio */}
        <Text style={styles.bio}>
          {bio || `${specialty} coach, here to help you reach your fitness goals. Training, motivation, and results. 💪`}
        </Text>

        <TouchableOpacity>
          <Text style={styles.moreInfo}>More info</Text>
        </TouchableOpacity>

        {/* ACTION BUTTONS ROW (like OF: tips, message, etc.) */}
        <View style={styles.actionsRow}>
          <ActionButton icon="chatbubble-outline" label="Message" />
          <ActionButton icon="cash-outline" label="Subscribe" />
          <ActionButton icon="star-outline" label="Favorite" />
          <ActionButton icon="share-social-outline" label="Share" />
        </View>

        {/* SOCIAL LINKS */}
        <View style={styles.socialsRow}>
          <SocialButton icon="logo-facebook" label="Facebook" color="#1877F2" />
          <SocialButton icon="logo-youtube" label="Youtube" color="#FF0000" />
          <SocialButton icon="logo-tiktok" label="Tiktok" color="#000000" />
          <SocialButton icon="logo-twitter" label="Twitter" color="#1DA1F2" />
        </View>

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
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Cover
  coverContainer: { width, height: 200, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.15)' },

  // Profile section
  profileSection: { alignItems: 'center', marginTop: -50, paddingHorizontal: 20 },

  // Avatar
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.white },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.white, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontSize: 40, fontWeight: 'bold' },
  onlineDot: { position: 'absolute', bottom: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CAF50', borderWidth: 3, borderColor: colors.white },

  // Stats
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 12, marginBottom: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentIce, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statText: { fontSize: 12, fontWeight: '600', color: colors.text },

  // Name
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  coachName: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  verifiedBadge: {},
  handle: { fontSize: 14, color: colors.textLight, marginTop: 2, marginBottom: 10 },
  bio: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  moreInfo: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 6, marginBottom: 16 },

  // Actions row
  actionsRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.accentIce, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600' },

  // Social links
  socialsRow: { flexDirection: 'row', gap: 10, marginBottom: 25, flexWrap: 'wrap', justifyContent: 'center' },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  socialText: { color: colors.white, fontSize: 13, fontWeight: '600' },

  // About / Offer
  aboutSection: { width: '100%', marginTop: 10 },
  aboutTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  offerCard: { flexDirection: 'row', gap: 14, backgroundColor: colors.white, padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'flex-start' },
  offerTextBlock: { flex: 1 },
  offerTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 3 },
  offerDesc: { fontSize: 13, color: colors.textLight, lineHeight: 19 },
});

export default CoachProfileScreen;