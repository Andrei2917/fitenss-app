import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { forumApi } from '../../services/api/forumApi';
import { colors } from '../../constants/colors';

const PostDetailScreen = ({ route }: any) => {
  const { postId } = route.params;
  
  // THE FIX: Grab the whole auth state, then look for either a user OR a coach!
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
    if (!myId) return Alert.alert('Error', 'Could not find your ID.'); // Stops silent failures

    setIsSubmitting(true);
    try {
      // Just send the ID! The backend handles the rest.
      const payload = { content: newComment, userId: myId };

      await forumApi.createComment(postId, payload);
      setNewComment('');
      fetchPostDetails(); // Reload to show the new comment!
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: any }) => {
    const isCoachComment = !!item.coach;
    const authorName = isCoachComment ? item.coach.name : (item.user?.name || 'Anonymous');

    return (
      <View style={styles.commentCard}>
        {/* AUTHOR HEADER ROW */}
        <View style={styles.authorHeader}>
          <Text style={[styles.commentAuthor, isCoachComment && styles.coachNameText]}>
            {authorName}
          </Text>
          
          {/* THE VERIFIED COACH BANNER */}
          {isCoachComment && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Coach</Text>
            </View>
          )}
        </View>

        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };

  if (!post) return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;

  const isCoachPost = !!post.coach;
  const postAuthor = isCoachPost ? post.coach.name : (post.user?.name || 'Anonymous');

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
            <Text style={styles.postTitle}>{post.title}</Text>
            
            {/* ORIGINAL POST AUTHOR HEADER */}
            <View style={styles.authorHeader}>
              <Text style={styles.postAuthor}>By {postAuthor}</Text>
              {isCoachPost && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified Coach</Text>
                </View>
              )}
            </View>

            <Text style={styles.postContent}>{post.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No replies yet.</Text>}
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
  
  originalPostCard: { backgroundColor: colors.white, padding: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  postTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  postAuthor: { fontSize: 14, color: colors.textLight },
  postContent: { fontSize: 16, color: colors.text, lineHeight: 24, marginTop: 10 },

  commentCard: { backgroundColor: colors.white, padding: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  
  // HEADER STYLES
  authorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  commentAuthor: { fontSize: 14, fontWeight: 'bold', color: colors.textLight },
  coachNameText: { color: colors.primary },
  
  // THE VERIFIED BADGE UI
  verifiedBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  commentContent: { fontSize: 15, color: colors.text, lineHeight: 22 },
  emptyText: { textAlign: 'center', marginTop: 30, color: colors.textLight },

  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100 },
  sendButton: { marginLeft: 10, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: colors.white, fontWeight: 'bold', fontSize: 15 },
});

export default PostDetailScreen;