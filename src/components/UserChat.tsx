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
    senderId: string;
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

  const navigation = useNavigation<NavigationProp>();
  const { socket } = useSocketContext();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const senderId = userId;
      const receiverId = item?.userId;
      if (!senderId || !receiverId) return;

      const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
        params: { senderId, receiverId },
      });

      if (response.data && response.data.length > 0) {
        setLastMessage(response.data[response.data.length - 1]);
        // Example placeholder for unread message logic
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Error fetching messages for user:', item?.userId, error);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
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
  };

  const isMyMessage = lastMessage?.senderId === userId;

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('ChatRoom', {
          image: item?.imageUrls?.[0] ?? '',
          name: item?.firstName ?? '',
          receiverId: item?.userId ?? '',
          senderId: userId,
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
            ]}
            numberOfLines={1}
          >
            {isMyMessage && lastMessage && 'You: '}
            {lastMessage?.message ?? `Say hi to ${item?.firstName ?? 'them'}!`}
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timestamp: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  placeholderMessage: {
    color: '#999',
    fontStyle: 'italic',
  },
  unreadMessage: {
    color: '#1A1A1A',
    fontWeight: '600',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
