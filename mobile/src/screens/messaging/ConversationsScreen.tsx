import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../../store';
import { messageApi } from '../../services/api/messageApi';
import { colors } from '../../constants/colors';

interface Conversation {
  coachId?: string;
  coachName?: string;
  coachProfilePictureUrl?: string;
  coachSpecialty?: string;
  userId?: string;
  userName?: string;
  userProfilePictureUrl?: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

const ConversationsScreen = ({ navigation }: any) => {
  const authState = useSelector((state: RootState) => state.auth as any);
  const isCoach = authState.role === 'coach';
  const myId = isCoach ? authState.coach?.id : authState.user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const data = isCoach
        ? await messageApi.getCoachConversations(myId)
        : await messageApi.getUserConversations(myId);
      setConversations(data);
    } catch (error) {
      // Fail silently
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadConversations(); };

  const handleOpenChat = (conv: Conversation) => {
    const chatParams = isCoach
      ? { coachId: myId, coachName: authState.coach?.name, userId: conv.userId }
      : { coachId: conv.coachId, coachName: conv.coachName, userId: myId };
    
    navigation.navigate('Chat', chatParams);
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const name = isCoach ? item.userName : item.coachName;
    const avatar = isCoach ? item.userProfilePictureUrl : item.coachProfilePictureUrl;
    const subtitle = isCoach ? '' : item.coachSpecialty;

    return (
      <TouchableOpacity style={styles.convRow} onPress={() => handleOpenChat(item)}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.convInfo}>
          <Text style={styles.convName}>{name}</Text>
          {subtitle ? <Text style={styles.convSubtitle}>{subtitle}</Text> : null}
          <Text style={styles.convLastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet — say hello!'}
          </Text>
        </View>

        <View style={styles.convRight}>
          <Text style={styles.convTime}>
            {item.lastMessage ? new Date(item.lastMessageAt).toLocaleDateString() : ''}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => (isCoach ? item.userId! : item.coachId!)}
        renderItem={renderConversation}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={70} color={colors.border} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              {isCoach 
                ? 'Your subscribed clients will appear here.'
                : 'Subscribe to a coach and start chatting!'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  convRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  convInfo: { flex: 1, marginLeft: 14 },
  convName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  convSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  convLastMessage: { fontSize: 13, color: colors.textLight, marginTop: 3 },
  convRight: { alignItems: 'flex-end', gap: 6 },
  convTime: { fontSize: 11, color: colors.textLight },
  unreadBadge: { backgroundColor: colors.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textLight, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default ConversationsScreen;