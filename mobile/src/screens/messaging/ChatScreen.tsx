import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { messageApi } from '../../services/api/messageApi';
import { colors } from '../../constants/colors';

interface Message {
  id: string;
  content: string;
  senderType: string;
  createdAt: string;
}

const ChatScreen = ({ route }: any) => {
  const { coachId, coachName, userId: routeUserId } = route.params;
  const authState = useSelector((state: RootState) => state.auth as any);
  const isCoach = authState.role === 'coach';
  const userId = routeUserId || authState.user?.id;
  const senderType = isCoach ? 'coach' : 'user';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollInterval = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    messageApi.markAsRead(userId, coachId, senderType);
    pollInterval.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollInterval.current);
  }, []);

  const loadMessages = async () => {
    try {
      const data = await messageApi.getMessages(userId, coachId);
      setMessages(data);
    } catch (error) {
      // Silent fail on poll
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      await messageApi.sendMessage(newMessage.trim(), senderType, userId, coachId);
      setNewMessage('');
      await loadMessages();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      // Show error inline
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderType === senderType;
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMyMessage && { color: colors.white }]}>{item.content}</Text>
        <Text style={[styles.messageTime, isMyMessage && { color: 'rgba(255,255,255,0.6)' }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color={colors.border} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Say hello to {coachName}! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.5 }]} 
          onPress={handleSend}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16, paddingBottom: 10 },

  messageBubble: { maxWidth: '78%', padding: 12, borderRadius: 18, marginBottom: 8 },
  myMessage: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: colors.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  messageText: { fontSize: 15, lineHeight: 21, color: colors.text },
  messageTime: { fontSize: 11, color: colors.textLight, marginTop: 4, alignSelf: 'flex-end' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.textLight, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: colors.white },
  textInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 10 },
  sendBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;