import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../../store';
import { messageApi } from '../../services/api/messageApi';

interface Conversation {
  coachId?: string; coachName?: string; coachProfilePictureUrl?: string; coachSpecialty?: string;
  userId?: string; userName?: string; userProfilePictureUrl?: string;
  lastMessage: string | null; lastMessageAt: string; unreadCount: number;
}

export default function ConversationsScreen({ navigation }: any) {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isCoach = authState.role === 'coach';
  const myId = isCoach ? authState.coach?.id : authState.user?.id;

  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = isCoach
        ? await messageApi.getCoachConversations(myId)
        : await messageApi.getUserConversations(myId);
      setConvs(data);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openChat = (conv: Conversation) => {
    const params = isCoach
      ? { coachId: myId, coachName: authState.coach?.name, userId: conv.userId }
      : { coachId: conv.coachId, coachName: conv.coachName, userId: myId };
    navigation.navigate('Chat', params);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const name = isCoach ? item.userName : item.coachName;
    const photo = isCoach ? item.userProfilePictureUrl : item.coachProfilePictureUrl;
    const sub = !isCoach ? item.coachSpecialty : null;
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity style={S.row} activeOpacity={0.82} onPress={() => openChat(item)}>
        <View style={S.avatarWrap}>
          {photo
            ? <Image source={{ uri: photo }} style={S.avatar} />
            : (
              <LinearGradient colors={['#21277B', '#4A6FA5']} style={S.avatarGrad}>
                <Text style={S.avatarText}>{name?.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )
          }
          {hasUnread && <View style={S.unreadDot} />}
        </View>

        <View style={S.info}>
          <View style={S.nameRow}>
            <Text style={[S.name, hasUnread && S.nameBold]} numberOfLines={1}>{name}</Text>
            <Text style={[S.time, hasUnread && S.timeBold]}>
              {item.lastMessage ? formatTime(item.lastMessageAt) : ''}
            </Text>
          </View>
          {sub && <Text style={S.specialty} numberOfLines={1}>{sub}</Text>}
          <View style={S.lastRow}>
            <Text style={[S.lastMsg, hasUnread && S.lastMsgBold]} numberOfLines={1}>
              {item.lastMessage || 'Say hello! 👋'}
            </Text>
            {hasUnread && (
              <View style={S.badge}>
                <Text style={S.badgeText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={S.loader}><ActivityIndicator size="large" color="#21277B" /></View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#21277B', '#2E3596']} style={S.header}>
        <Text style={S.headerTitle}>Messages</Text>
        <Text style={S.headerSub}>{convs.length} conversation{convs.length !== 1 ? 's' : ''}</Text>
        <View style={S.headerCurve} />
      </LinearGradient>

      <FlatList
        data={convs}
        keyExtractor={item => (isCoach ? item.userId! : item.coachId!)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#21277B" />}
        contentContainerStyle={convs.length === 0 ? S.emptyFlex : S.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={S.empty}>
            <View style={S.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={36} color="#21277B" />
            </View>
            <Text style={S.emptyTitle}>No conversations yet</Text>
            <Text style={S.emptySub}>
              {isCoach ? 'Your clients will appear here.' : 'Subscribe to a coach to start chatting!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
});

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4FA' },

  header: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  headerCurve: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 20, backgroundColor: '#F2F4FA', borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  listContent: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 24 },
  emptyFlex: { flex: 1 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, padding: 14, ...CARD_SHADOW },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarGrad: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  unreadDot: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },

  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '600', color: '#0D1117', flex: 1, marginRight: 8 },
  nameBold: { fontWeight: '800' },
  time: { fontSize: 11, color: '#9CA3AF' },
  timeBold: { color: '#21277B', fontWeight: '700' },
  specialty: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 3 },
  lastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lastMsg: { fontSize: 13, color: '#9CA3AF', flex: 1 },
  lastMsgBold: { color: '#374151', fontWeight: '600' },
  badge: { backgroundColor: '#21277B', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(33,39,123,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0D1117', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
