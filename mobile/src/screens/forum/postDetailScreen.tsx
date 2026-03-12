import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { forumApi } from '../../services/api/forumApi';
import { colors } from '../../constants/colors';

// Small reusable avatar component (like Reddit)
const MiniAvatar = ({ uri, name, size = 32 }: { uri?: string; name: string; size?: number }) => {
  if (uri) {
    return <Image source={{ uri }} style={[styles.miniAvatar, { width: size, height: size, borderRadius: size / 2 }]} />;
  }
  return (
    <View style={[styles.miniAvatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.miniAvatarText, { fontSize: size * 0.45 }]}>{name?.charAt(0)?.toUpperCase() || '?'}</Text>
    </View>
  );
};

const PostDetailScreen = ({ route }: any) => {
  const { postId } = route.params;
  
  const authState = useSelector((state: RootState) => state.auth as any);
  const myId = authState?.user?.id || authState?.coach?.id;
  
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostDetails = async () => {
    try {
      const data = await forumApi.getPostById(postId);
      setPost(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchPostDetails(); }, []);

  const handleReply = async () => {
    if (!newComment.trim()) return;
    if (!myId) return Alert.alert('Error', 'Could not find your ID.');

    setIsSubmitting(true);
    try {
      const payload = { content: newComment, userId: myId };
      await forumApi.createComment(postId, payload);
      setNewComment('');
      fetchPostDetails();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: any }) => {
    const isCoachComment = !!item.coach;
    const authorName = isCoachComment ? item.coach.name : (item.user?.name || 'Anonymous');
    const authorAvatar = isCoachComment ? item.coach.profilePictureUrl : item.user?.profilePictureUrl;

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentRow}>
          {/* AVATAR */}
          <MiniAvatar uri={authorAvatar} name={authorName} size={34} />
          
          <View style={styles.commentBody}>
            {/* AUTHOR HEADER ROW */}
            <View style={styles.authorHeader}>
              <Text style={[styles.commentAuthor, isCoachComment && styles.coachNameText]}>
                {authorName}
              </Text>
              
              {isCoachComment && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Coach</Text>
                </View>
              )}

              <Text style={styles.commentTime}>
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>

            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!post) return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;

  const isCoachPost = !!post.coach;
  const postAuthor = isCoachPost ? post.coach.name : (post.user?.name || 'Anonymous');
  const postAvatar = isCoachPost ? post.coach.profilePictureUrl : post.user?.profilePictureUrl;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={post.comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={(
          <View style={styles.originalPostCard}>
            {/* ORIGINAL POST with avatar */}
            <View style={styles.postHeaderRow}>
              <MiniAvatar uri={postAvatar} name={postAuthor} size={40} />
              <View style={styles.postHeaderInfo}>
                <View style={styles.authorHeader}>
                  <Text style={[styles.postAuthorName, isCoachPost && { color: colors.primary }]}>{postAuthor}</Text>
                  {isCoachPost && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified Coach</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            
            <View style={styles.repliesHeader}>
              <Text style={styles.repliesTitle}>
                {post.comments?.length || 0} {post.comments?.length === 1 ? 'Reply' : 'Replies'}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No replies yet. Be the first!</Text>}
      />

      {/* REPLY INPUT BAR */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newComment.trim() && { opacity: 0.5 }]} 
          onPress={handleReply}
          disabled={!newComment.trim() || isSubmitting}
        >
          <Text style={styles.sendText}>{isSubmitting ? '...' : 'Reply'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Original post
  originalPostCard: { backgroundColor: colors.white, padding: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  postHeaderInfo: { marginLeft: 12, flex: 1 },
  postAuthorName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
  postDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  postTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  postContent: { fontSize: 16, color: colors.text, lineHeight: 24 },
  
  repliesHeader: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  repliesTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Comments
  commentCard: { backgroundColor: colors.white, paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  commentBody: { marginLeft: 10, flex: 1 },
  
  authorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8, flexWrap: 'wrap' },
  commentAuthor: { fontSize: 13, fontWeight: 'bold', color: colors.textLight },
  coachNameText: { color: colors.primary },
  commentTime: { fontSize: 11, color: '#bbb' },
  
  verifiedBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  commentContent: { fontSize: 14, color: colors.text, lineHeight: 21 },
  emptyText: { textAlign: 'center', marginTop: 30, color: colors.textLight, fontSize: 14 },

  // Mini Avatar
  miniAvatar: { borderWidth: 1, borderColor: '#eee' },
  miniAvatarPlaceholder: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: colors.white, fontWeight: 'bold' },

  // Input bar
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100 },
  sendButton: { marginLeft: 10, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: colors.white, fontWeight: 'bold', fontSize: 15 },
});

export default PostDetailScreen;