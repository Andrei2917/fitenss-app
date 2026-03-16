import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { messageApi } from '../../services/api/messageApi';

interface Message {
  id: string; content: string; senderType: string; createdAt: string; read: boolean;
}

export default function ChatScreen({ route }: any) {
  const { coachId, coachName, userId: routeUserId } = route.params;
  const authState = useSelector((state: RootState) => state.auth as any);
  const isCoach = authState.role === 'coach';
  const userId = routeUserId || authState.user?.id;
  const senderType = isCoach ? 'coach' : 'user';

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const poll = useRef<any>(null);

  useEffect(() => {
    loadMsgs();
    messageApi.markAsRead(userId, coachId, senderType);
    poll.current = setInterval(() => {
      loadMsgs();
      messageApi.markAsRead(userId, coachId, senderType);
    }, 3000);
    return () => clearInterval(poll.current);
  }, []);

  const loadMsgs = async () => {
    try {
      const data = await messageApi.getMessages(userId, coachId);
      setMessages(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await messageApi.sendMessage(text.trim(), senderType, userId, coachId);
      setText('');
      await loadMsgs();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const Checks = ({ read }: { read: boolean }) => (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
      <Ionicons name="checkmark" size={13} color={read ? '#53bdeb' : 'rgba(255,255,255,0.45)'} style={{ marginRight: -5 }} />
      <Ionicons name="checkmark" size={13} color={read ? '#53bdeb' : 'rgba(255,255,255,0.45)'} />
    </View>
  );

  const renderMsg = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.senderType === senderType;
    const prev = index > 0 ? messages[index - 1] : null;
    const showDate = !prev || new Date(item.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <View style={S.dateSep}>
            <View style={S.dateLine} />
            <Text style={S.dateText}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
            <View style={S.dateLine} />
          </View>
        )}
        <View style={[S.bubble, mine ? S.mine : S.theirs]}>
          {mine
            ? (
              <LinearGradient colors={['#2E3596', '#21277B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.bubbleGrad}>
                <Text style={S.mineText}>{item.content}</Text>
                <View style={S.msgFooter}>
                  <Text style={S.mineTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Checks read={item.read} />
                </View>
              </LinearGradient>
            ) : (
              <View style={S.theirBubble}>
                <Text style={S.theirText}>{item.content}</Text>
                <Text style={S.theirTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )
          }
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={S.loader}><ActivityIndicator size="large" color="#21277B" /></View>
  );

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={listRef}
        data={messages} keyExtractor={i => i.id}
        renderItem={renderMsg}
        contentContainerStyle={S.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={S.emptyWrap}>
            <View style={S.emptyIcon}>
              <Ionicons name="chatbubble-outline" size={32} color="#21277B" />
            </View>
            <Text style={S.emptyTitle}>Start the conversation</Text>
            <Text style={S.emptySub}>Say hello to {coachName}! 👋</Text>
          </View>
        }
      />

      <View style={S.inputBar}>
        <TextInput
          style={S.input}
          placeholder="Type a message..."
          placeholderTextColor="#C4C9D4"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[S.sendBtn, !text.trim() && { opacity: 0.4 }]}
          onPress={send}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4FA' },
  list: { padding: 16, paddingBottom: 8 },

  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dateText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  bubble: { maxWidth: '78%', marginBottom: 4 },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  bubbleGrad: { borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
  theirBubble: { backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, borderWidth: 1, borderColor: '#EAECF0', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }, android: { elevation: 1 } }) },
  mineText: { fontSize: 15, color: '#fff', lineHeight: 21 },
  theirText: { fontSize: 15, color: '#0D1117', lineHeight: 21 },
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
  mineTime: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  theirTime: { fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 3 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(33,39,123,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0D1117', marginBottom: 5 },
  emptySub: { fontSize: 13, color: '#9CA3AF' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 8 } }),
  },
  input: {
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
