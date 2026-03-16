import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { forumApi } from '../../services/api/forumApi';

const Avatar = ({ uri, name, size = 36 }: { uri?: string; name: string; size?: number }) => {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <LinearGradient colors={['#21277B', '#4A6FA5']}
      style={{ width: size, height: size, borderRadius: size / 2, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.42, fontWeight: '700' }}>
        {name?.charAt(0)?.toUpperCase() || '?'}
      </Text>
    </LinearGradient>
  );
};

export default function PostDetailScreen({ route }: any) {
  const { postId } = route.params;
  const authState = useSelector((state: RootState) => state.auth as any);
  const myId = authState?.user?.id || authState?.coach?.id;

  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPost = async () => {
    try { setPost(await forumApi.getPostById(postId)); }
    catch { /* silent */ }
  };
  useEffect(() => { loadPost(); }, []);

  const handleReply = async () => {
    if (!comment.trim() || !myId) return;
    setSubmitting(true);
    try {
      await forumApi.createComment(postId, { content: comment, userId: myId });
      setComment(''); loadPost();
    } catch { Alert.alert('Error', 'Failed to post reply.'); }
    finally { setSubmitting(false); }
  };

  const renderComment = ({ item }: { item: any }) => {
    const isCP = !!item.coach;
    const name = isCP ? item.coach.name : (item.user?.name || 'Anonymous');
    const photo = isCP ? item.coach.profilePictureUrl : item.user?.profilePictureUrl;
    return (
      <View style={S.commentCard}>
        <Avatar uri={photo} name={name} size={36} />
        <View style={S.commentRight}>
          <View style={S.commentHeader}>
            <Text style={[S.commentAuthor, isCP && { color: '#21277B' }]}>{name}</Text>
            {isCP && <View style={S.coachBadge}><Text style={S.coachBadgeText}>COACH</Text></View>}
            <Text style={S.commentDate}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Text style={S.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (!post) return (
    <View style={S.loader}><ActivityIndicator size="large" color="#21277B" /></View>
  );

  const isCP = !!post.coach;
  const postAuthor = isCP ? post.coach.name : (post.user?.name || 'Anonymous');
  const postPhoto = isCP ? post.coach.profilePictureUrl : post.user?.profilePictureUrl;

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={post.comments} keyExtractor={(i: any) => i.id}
        renderItem={renderComment}
        contentContainerStyle={S.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View>
            <View style={S.postCard}>
              <View style={S.postAuthorRow}>
                <Avatar uri={postPhoto} name={postAuthor} size={44} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[S.postAuthorName, isCP && { color: '#21277B' }]}>{postAuthor}</Text>
                    {isCP && (
                      <View style={S.verifiedBadge}>
                        <Ionicons name="checkmark" size={9} color="#fff" />
                        <Text style={S.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={S.postDate}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <Text style={S.postTitle}>{post.title}</Text>
              <Text style={S.postContent}>{post.content}</Text>
              <View style={S.statsBar}>
                <View style={S.statItem}>
                  <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" />
                  <Text style={S.statText}>{post.comments?.length || 0} replies</Text>
                </View>
              </View>
            </View>
            {(post.comments?.length || 0) > 0 && (
              <Text style={S.repliesHeader}>Replies</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={S.emptyReplies}>
            <View style={S.emptyIcon}><Ionicons name="chatbubble-outline" size={28} color="#21277B" /></View>
            <Text style={S.emptyTitle}>No replies yet</Text>
            <Text style={S.emptySub}>Be the first to respond!</Text>
          </View>
        }
      />

      <View style={S.replyBar}>
        <TextInput
          style={S.replyInput} placeholder="Add a reply..." placeholderTextColor="#C4C9D4"
          value={comment} onChangeText={setComment} multiline maxLength={1000}
        />
        <TouchableOpacity
          style={[S.sendBtn, !comment.trim() && { opacity: 0.4 }]}
          onPress={handleReply} disabled={!comment.trim() || submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const SHADOW = Platform.select({
  ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12 },
  android: { elevation: 4 },
});

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4FA' },
  list: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16 },

  postCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 8, ...SHADOW },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  postAuthorName: { fontSize: 15, fontWeight: '700', color: '#0D1117' },
  postDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#21277B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  postTitle: { fontSize: 20, fontWeight: '800', color: '#0D1117', marginBottom: 10, lineHeight: 27, letterSpacing: -0.3 },
  postContent: { fontSize: 15, color: '#374151', lineHeight: 24, marginBottom: 16 },
  statsBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F2F4FA', paddingTop: 12, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  repliesHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },

  commentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', ...SHADOW },
  commentRight: { flex: 1, marginLeft: 12 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#0D1117' },
  coachBadge: { backgroundColor: '#EEF1FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  coachBadgeText: { fontSize: 9, fontWeight: '700', color: '#21277B', letterSpacing: 0.5 },
  commentDate: { fontSize: 11, color: '#C4C9D4', marginLeft: 'auto' as any },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 21 },

  emptyReplies: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(33,39,123,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0D1117', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#9CA3AF' },

  replyBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 8 } }),
  },
  replyInput: {
    flex: 1, backgroundColor: '#F2F4FA', borderRadius: 22, paddingHorizontal: 16,
    paddingTop: 10, paddingBottom: 10, fontSize: 14, maxHeight: 100,
    color: '#0D1117', marginRight: 10, borderWidth: 1.5, borderColor: '#EAECF0',
  },
  sendBtn: {
    backgroundColor: '#21277B', width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 }, android: { elevation: 6 } }),
  },
});
