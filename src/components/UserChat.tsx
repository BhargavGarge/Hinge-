import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL } from '../url/url';
import { useSocketContext } from '../../SocketContext';
import type { ChatItem, Message } from '../screens/ChatScreen';

type RootStackParamList = {
  ChatRoom: {
    image: string;
    name: string;
    receiverId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

interface UserChatProps {
  item: ChatItem;
  userId: string;
}

const UserChat = ({ item, userId }: UserChatProps) => {
  const [lastMessage, setLastMessage] = useState<Message | null>(
    item.lastMessage ?? null,
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const { socket } = useSocketContext();

  useEffect(() => {
    fetchMessages();
  }, [item.userId, userId]);

  // Listen for new messages to update last message in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      // Check if this message is for this chat
      if (
        (newMessage.senderId === item.userId &&
          newMessage.receiverId === userId) ||
        (newMessage.senderId === userId &&
          newMessage.receiverId === item.userId)
      ) {
        console.log('🔄 Updating last message via socket');
        setLastMessage(newMessage);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [socket, item.userId, userId]);

  const fetchMessages = async () => {
    try {
      setIsRefreshing(true);
      const senderId = userId;
      const receiverId = item?.userId;
      if (!senderId || !receiverId) return;

      console.log(`📨 Fetching messages for ${item.firstName}`);

      // Try multiple endpoints with proper error handling
      let messages: Message[] = [];

      try {
        // First try the main endpoint
        const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
          params: { senderId, receiverId },
        });
        messages = response.data;
      } catch (error) {
        console.log('❌ Main endpoint failed, trying fallback...');
        // Try fallback endpoint
        try {
          const fallbackResponse = await axios.get<Message[]>(
            `${BASE_URL}/messages/${receiverId}`,
            { params: { senderId } },
          );
          messages = fallbackResponse.data;
        } catch (fallbackError) {
          console.log('❌ Fallback endpoint also failed');
          messages = [];
        }
      }

      if (messages && messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        setLastMessage(latestMessage);
        console.log(
          `✅ Last message for ${item.firstName}:`,
          latestMessage.message,
        );

        // Calculate unread count
        const unreadMessages = messages.filter(
          msg => msg.senderId === receiverId && !(msg as any).seen,
        );
        setUnreadCount(unreadMessages.length);
      } else {
        setLastMessage(null);
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Error fetching messages for user:', item?.userId, error);
      setLastMessage(null);
      setUnreadCount(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - messageDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;

      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  const isMyMessage = lastMessage?.senderId === userId;

  const getMessagePreview = () => {
    if (!lastMessage) {
      return `Say hi to ${item?.firstName ?? 'them'}!`;
    }

    if (isMyMessage) {
      return `You: ${lastMessage.message}`;
    }

    return lastMessage.message || '';
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('ChatRoom', {
          image: item?.imageUrls?.[0] ?? '',
          name: item?.firstName ?? '',
          receiverId: item?.userId ?? '',
        })
      }
      style={({ pressed }) => [
        styles.chatContainer,
        pressed && styles.chatContainerPressed,
      ]}
    >
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#FF6B9D', '#C06C84', '#8B5A8E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarGradientBorder}
        >
          <View style={styles.avatarInnerBorder}>
            <Image
              style={styles.userImage}
              source={{
                uri: item?.imageUrls?.[0] ?? 'https://via.placeholder.com/70',
              }}
              defaultSource={{ uri: 'https://via.placeholder.com/70' }}
            />
          </View>
        </LinearGradient>
        <View style={styles.onlineIndicator} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item?.firstName ?? 'Unknown User'}
          </Text>
          {lastMessage && (
            <Text style={styles.timestamp}>
              {formatTimestamp(lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              !lastMessage && styles.placeholderMessage,
              !isMyMessage && lastMessage && styles.unreadMessage,
              isRefreshing && styles.refreshingMessage,
            ]}
            numberOfLines={1}
          >
            {getMessagePreview()}
          </Text>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  chatContainerPressed: {
    backgroundColor: '#FAFAFA',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradientBorder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2,
  },
  avatarInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontWeight: '700',
    fontSize: 17,
    color: '#1A1A1A',
    flex: 1,
  },
  timestamp: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
    flex: 1,
  },
  placeholderMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
  unreadMessage: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  refreshingMessage: {
    opacity: 0.7,
  },
  unreadBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chevronContainer: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 24,
    color: '#CCC',
    fontWeight: '300',
  },
});
