import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, Image, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { forumApi } from '../../services/api/forumApi';
import { coachApi } from '../../services/api/coachApi';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

interface Coach {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  profilePictureUrl?: string;
}

const ForumListScreen = ({ navigation }: any) => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const myId = authState?.user?.id || authState?.coach?.id;
  const isCurrentUserCoach = !!authState?.coach || authState?.role === 'coach';
  
  const [posts, setPosts] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchData = async () => {
    try {
      const [postsData, coachesData] = await Promise.all([
        forumApi.getPosts(),
        !isCurrentUserCoach ? coachApi.getAllCoaches() : Promise.resolve([]),
      ]);
      setPosts(postsData);
      if (!isCurrentUserCoach) setCoaches(coachesData);
    } catch (error: any) {
      Alert.alert('Error', 'Could not load data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return Alert.alert('Error', 'Title and content are required.');
    if (!myId) return Alert.alert('Error', 'Could not find your ID.');
    
    try {
      const payload = { title: newTitle, content: newContent, userId: myId };
      await forumApi.createPost(payload);
      setModalVisible(false);
      setNewTitle('');
      setNewContent('');
      onRefresh(); 
    } catch (error) {
      Alert.alert('Error', 'Failed to post.');
    }
  };

  // ========================================
  // COACH CARD (YouTube Music "Albums for you" style)
  // ========================================
  const renderCoachCard = ({ item }: { item: Coach }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() =>
        navigation.navigate('CoachProfile', {
          coachId: item.id,
          coachName: item.name,
          specialty: item.specialty,
          bio: item.bio,
          profilePictureUrl: item.profilePictureUrl,
        })
      }
    >
      <View style={styles.coachImageContainer}>
        {item.profilePictureUrl ? (
          <Image source={{ uri: item.profilePictureUrl }} style={styles.coachImage} />
        ) : (
          <View style={styles.coachImagePlaceholder}>
            <Text style={styles.coachInitial}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.coachCardName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.coachCardSpecialty} numberOfLines={1}>{item.specialty || 'Fitness Coach'}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: any }) => {
    const isCoachPost = !!item.coach;
    const authorName = isCoachPost ? item.coach.name : (item.user?.name || 'Anonymous');
    const authorPhoto = isCoachPost ? item.coach?.profilePictureUrl : item.user?.profilePictureUrl;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('PostDetail', { postId: item.id, title: item.title })}
      >
        <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.authorRow}>
          <View style={styles.authorInfoRow}>
            {/* AUTHOR AVATAR */}
            {authorPhoto ? (
              <Image source={{ uri: authorPhoto }} style={styles.authorAvatar} />
            ) : (
              <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
                <Text style={styles.authorAvatarText}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* AUTHOR NAME + BADGE */}
            <View style={styles.authorNameContainer}>
              <Text style={[styles.authorName, isCoachPost && styles.coachName]}>
                {authorName}
              </Text>
              {isCoachPost && (
                <View style={styles.verifiedBadgeSmall}>
                  <Text style={styles.verifiedTextSmall}>✓</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.commentCount}>💬 {item._count?.comments || 0} Comments</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            !isCurrentUserCoach && coaches.length > 0 ? (
              <View style={styles.carouselSection}>
                <Text style={styles.carouselTitle}>Explore Coaches</Text>
                <FlatList
                  data={coaches}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCoachCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                  snapToInterval={CARD_WIDTH + 12}
                  decelerationRate="fast"
                />
              </View>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No discussions yet. Be the first to ask a question!</Text>}
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Ask</Text>
      </TouchableOpacity>

      {/* NEW POST MODAL */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Discussion</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Question Title" 
            value={newTitle} 
            onChangeText={setNewTitle} 
            maxLength={100}
          />
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="What's on your mind?" 
            value={newContent} 
            onChangeText={setNewContent} 
            multiline 
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreatePost} style={styles.submitButton}>
              <Text style={styles.submitText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ============= COACH CAROUSEL STYLES =============
  carouselSection: { marginBottom: 20 },
  carouselTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 14 },
  
  coachCard: {
    width: CARD_WIDTH,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  coachImageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: colors.accentIce,
  },
  coachImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coachImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  coachCardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  coachCardSpecialty: {
    fontSize: 12,
    color: colors.textLight,
    paddingHorizontal: 10,
    paddingBottom: 12,
    marginTop: 2,
  },
  // ==================================================

  card: { backgroundColor: colors.white, padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  
  // Author row — now includes avatar
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  
  // Author avatar (small circle on post cards)
  authorAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
  authorAvatarPlaceholder: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  authorAvatarText: { color: colors.white, fontSize: 14, fontWeight: 'bold' },

  authorNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorName: { fontSize: 14, color: colors.textLight, fontWeight: '500' },
  coachName: { color: colors.primary, fontWeight: 'bold' },
  verifiedBadgeSmall: { backgroundColor: colors.primary, borderRadius: 10, width: 14, height: 14, justifyContent: 'center', alignItems: 'center' },
  verifiedTextSmall: { color: colors.white, fontSize: 9, fontWeight: 'bold' },
  
  commentCount: { fontSize: 13, color: colors.textLight },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.textLight, fontSize: 16 },
  
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, elevation: 5 },
  fabText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },

  modalContainer: { flex: 1, padding: 25, backgroundColor: colors.background, paddingTop: 60 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  input: { backgroundColor: colors.white, padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  textArea: { height: 150 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  cancelButton: { padding: 15, borderRadius: 10 },
  cancelText: { color: colors.textLight, fontSize: 16, fontWeight: 'bold' },
  submitButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, paddingHorizontal: 30 },
  submitText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});

export default ForumListScreen;