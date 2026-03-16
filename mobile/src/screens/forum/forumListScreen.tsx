import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, RefreshControl,
  Image, Dimensions, Platform, KeyboardAvoidingView, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { forumApi } from '../../services/api/forumApi';
import { coachApi } from '../../services/api/coachApi';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.44;

interface Coach {
  id: string; name: string; specialty: string;
  bio?: string; profilePictureUrl?: string;
}

export default function ForumListScreen({ navigation }: any) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const myId = authState?.user?.id || authState?.coach?.id;
  const isCoach = !!authState?.coach || authState?.role === 'coach';

  const [posts, setPosts] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchData = async () => {
    try {
      const [p, c] = await Promise.all([
        forumApi.getPosts(),
        !isCoach ? coachApi.getAllCoaches() : Promise.resolve([]),
      ]);
      setPosts(p);
      if (!isCoach) setCoaches(c);
    } catch { Alert.alert('Error', 'Could not load data.'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return Alert.alert('Missing fields', 'Fill in both fields.');
    setPosting(true);
    try {
      await forumApi.createPost({ title, content, userId: myId });
      setModal(false); setTitle(''); setContent('');
      setRefreshing(true); fetchData();
    } catch { Alert.alert('Error', 'Failed to post.'); }
    finally { setPosting(false); }
  };

  const CoachCard = ({ item }: { item: Coach }) => (
    <TouchableOpacity
      style={S.coachCard} activeOpacity={0.85}
      onPress={() => navigation.navigate('CoachProfile', {
        coachId: item.id, coachName: item.name,
        specialty: item.specialty, bio: item.bio,
        profilePictureUrl: item.profilePictureUrl,
      })}
    >
      {item.profilePictureUrl
        ? <Image source={{ uri: item.profilePictureUrl }} style={S.coachImg} />
        : (
          <LinearGradient colors={['#21277B', '#4A6FA5']} style={S.coachImgGrad}>
            <Text style={S.coachInitial}>{item.name[0].toUpperCase()}</Text>
          </LinearGradient>
        )
      }
      <View style={S.coachMeta}>
        <Text style={S.coachName} numberOfLines={1}>{item.name}</Text>
        <Text style={S.coachSub} numberOfLines={1}>{item.specialty || 'Coach'}</Text>
      </View>
    </TouchableOpacity>
  );

  const PostCard = ({ item }: { item: any }) => {
    const isCP = !!item.coach;
    const name = isCP ? item.coach.name : (item.user?.name || 'Anonymous');
    const photo = isCP ? item.coach?.profilePictureUrl : item.user?.profilePictureUrl;
    const cnt = item._count?.comments || 0;
    return (
      <TouchableOpacity
        style={S.postCard} activeOpacity={0.85}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id, title: item.title })}
      >
        <View style={[S.postAccent, { backgroundColor: isCP ? '#21277B' : '#E5E7EB' }]} />
        <View style={S.postBody}>
          <Text style={S.postTitle} numberOfLines={2}>{item.title}</Text>
          <View style={S.postFooter}>
            <View style={S.authorRow}>
              {photo
                ? <Image source={{ uri: photo }} style={S.ava} />
                : (
                  <LinearGradient colors={isCP ? ['#21277B','#4A6FA5'] : ['#9CA3AF','#6B7280']} style={[S.ava,S.avaGrad]}>
                    <Text style={S.avaText}>{name[0].toUpperCase()}</Text>
                  </LinearGradient>
                )
              }
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[S.authorName, isCP && S.authorCoach]}>{name}</Text>
                  {isCP && (
                    <View style={S.badge}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                  )}
                </View>
                {isCP && <Text style={S.coachTag}>COACH</Text>}
              </View>
            </View>
            <View style={S.commentBubble}>
              <Ionicons name="chatbubble-outline" size={11} color="#9CA3AF" />
              <Text style={S.commentCnt}>{cnt}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={15} color="#D1D5DB" style={{ marginRight: 14 }} />
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View>
      {/* Hero header */}
      <LinearGradient colors={['#21277B', '#2E3596']} style={S.hero}>
        <View style={S.heroContent}>
          <View>
            <Text style={S.heroTitle}>Community</Text>
            <Text style={S.heroSub}>{isCoach ? 'Share your expertise' : 'Ask, learn & connect'}</Text>
          </View>
          <TouchableOpacity style={S.askBtn} onPress={() => setModal(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color="#21277B" />
            <Text style={S.askBtnText}>Ask</Text>
          </TouchableOpacity>
        </View>
        {/* Bottom wave curve */}
        <View style={S.heroCurve} />
      </LinearGradient>

      <View style={S.body}>
        {!isCoach && coaches.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <View style={S.sectionRow}>
              <Text style={S.sectionTitle}>Explore Coaches</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FindCoach')}>
                <Text style={S.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={coaches} keyExtractor={i => i.id}
              renderItem={({ item }) => <CoachCard item={item} />}
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 4 }}
              snapToInterval={CARD_W + 12} decelerationRate="fast"
            />
          </View>
        )}

        <View style={S.sectionRow}>
          <Text style={S.sectionTitle}>Discussions</Text>
          <View style={S.countPill}>
            <Text style={S.countText}>{posts.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View style={S.loader}>
      <ActivityIndicator size="large" color="#21277B" />
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={posts} keyExtractor={i => i.id}
        renderItem={({ item }) => <PostCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#21277B" />}
        ListHeaderComponent={<Header />}
        contentContainerStyle={S.list}
        ListEmptyComponent={
          <View style={S.empty}>
            <View style={S.emptyIcon}><Ionicons name="chatbubbles-outline" size={36} color="#21277B" /></View>
            <Text style={S.emptyTitle}>No discussions yet</Text>
            <Text style={S.emptySub}>Be the first to start a conversation</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* New Post Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={S.modal}>
            <View style={S.modalHandle} />
            <View style={S.modalHeader}>
              <View>
                <Text style={S.modalTitle}>New Discussion</Text>
                <Text style={S.modalSub}>Share with the community</Text>
              </View>
              <TouchableOpacity style={S.closeBtn} onPress={() => { setModal(false); setTitle(''); setContent(''); }}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={S.inputLabel}>TITLE</Text>
              <TextInput style={S.input} placeholder="e.g. Best approach for fat loss?" placeholderTextColor="#C4C9D4"
                value={title} onChangeText={setTitle} maxLength={100} />

              <Text style={S.inputLabel}>CONTENT</Text>
              <TextInput style={[S.input, S.textArea]} placeholder="Describe your question in detail..."
                placeholderTextColor="#C4C9D4" value={content} onChangeText={setContent}
                multiline textAlignVertical="top" />

              <TouchableOpacity
                style={[S.submitBtn, (!title.trim() || !content.trim()) && { opacity: 0.45 }]}
                onPress={handlePost} disabled={posting || !title.trim() || !content.trim()}
              >
                <LinearGradient colors={['#21277B', '#3D4DB7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.submitGrad}>
                  {posting ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <Ionicons name="send" size={15} color="#fff" />
                      <Text style={S.submitText}>Post Discussion</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const SHADOW = Platform.select({
  ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12 },
  android: { elevation: 5 },
});

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4FA' },
  list: { paddingBottom: 24 },

  // Hero
  hero: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20 },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: '500' },
  heroCurve: {
    position: 'absolute', bottom: -1, left: 0, right: 0, height: 20,
    backgroundColor: '#F2F4FA', borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  askBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22,
    ...Platform.select({ ios: { shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:8 }, android:{elevation:6} }),
  },
  askBtnText: { color: '#21277B', fontWeight: '700', fontSize: 14 },

  body: { paddingHorizontal: 16, paddingTop: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0D1117', letterSpacing: -0.2 },
  seeAll: { fontSize: 13, color: '#21277B', fontWeight: '600' },
  countPill: { backgroundColor: '#E8EAFF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 12, color: '#21277B', fontWeight: '700' },

  // Coach card
  coachCard: { width: CARD_W, marginRight: 12, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', ...SHADOW },
  coachImg: { width: CARD_W, height: CARD_W * 0.82, resizeMode: 'cover' },
  coachImgGrad: { width: CARD_W, height: CARD_W * 0.82, justifyContent: 'center', alignItems: 'center' },
  coachInitial: { fontSize: 40, fontWeight: '800', color: '#fff' },
  coachMeta: { padding: 10 },
  coachName: { fontSize: 14, fontWeight: '700', color: '#0D1117' },
  coachSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },

  // Post card
  postCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...SHADOW,
  },
  postAccent: { width: 4, alignSelf: 'stretch' },
  postBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  postTitle: { fontSize: 15, fontWeight: '700', color: '#0D1117', lineHeight: 21, marginBottom: 10 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ava: { width: 26, height: 26, borderRadius: 13 },
  avaGrad: { justifyContent: 'center', alignItems: 'center' },
  avaText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  authorName: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  authorCoach: { color: '#21277B' },
  badge: { backgroundColor: '#21277B', borderRadius: 7, width: 13, height: 13, justifyContent: 'center', alignItems: 'center' },
  coachTag: { fontSize: 9, color: '#5F83B1', fontWeight: '700', letterSpacing: 0.5 },
  commentBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F2F4FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  commentCnt: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(33,39,123,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0D1117', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', fontWeight: '500' },

  // Modal
  modal: { flex: 1, backgroundColor: '#F2F4FA', paddingHorizontal: 20, paddingTop: 14 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0D1117', letterSpacing: -0.4 },
  modalSub: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...Platform.select({ios:{shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.08,shadowRadius:4},android:{elevation:2}}) },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 14, fontSize: 15, color: '#0D1117', borderWidth: 1.5, borderColor: '#EAECF0', marginBottom: 20 },
  textArea: { height: 140, paddingTop: 14 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4, marginBottom: 32, ...Platform.select({ios:{shadowColor:'#21277B',shadowOffset:{width:0,height:6},shadowOpacity:0.3,shadowRadius:12},android:{elevation:8}}) },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
