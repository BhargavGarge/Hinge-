'use client';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import {
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import { AuthContext } from '../../AuthContext';
import { useSocketContext } from '../../SocketContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Message } from '../../types'; // adjust to your type path

type ChatRoomNavigationProp = NativeStackNavigationProp<any>;
type ChatRoomRouteProp = RouteProp<
  { params: { receiverId: string; name: string; image: string } },
  'params'
>;

const ChatRoom = () => {
  // 🔹 Always call hooks in the same order — no conditions
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const { userId } = useContext(AuthContext) || { userId: null };
  const { socket } = useSocketContext() || { socket: null };

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🔹 Navigation Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
          </Pressable>
          <Image
            source={{
              uri: route.params?.image || 'https://via.placeholder.com/40',
            }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerName}>{route.params?.name}</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIconButton}>
            <Ionicons name="videocam" size={24} color="#FF6B9D" />
          </Pressable>
          <Pressable style={styles.headerIconButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, route.params?.name, route.params?.image]);

  // 🔹 Fetch messages safely
  const fetchMessages = async (): Promise<void> => {
    try {
      const senderId = userId;
      const receiverId = route.params?.receiverId;
      if (!senderId || !receiverId) return;

      const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
        params: { senderId, receiverId },
      });

      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.log('Error fetching messages:', error);
    }
  };

  // 🔹 Send message
  const sendMessage = async (): Promise<void> => {
    try {
      const senderId = userId;
      const receiverId = route.params?.receiverId;

      if (!message.trim() || !senderId || !receiverId) {
        console.log('Missing message or user IDs');
        return;
      }

      const messageToSend = message;
      setMessage('');

      await axios.post(`${BASE_URL}/sendMessage`, {
        senderId,
        receiverId,
        message: messageToSend,
      });

      socket?.emit('sendMessage', {
        senderId,
        receiverId,
        message: messageToSend,
      });

      // Refresh messages
      setTimeout(() => {
        fetchMessages();
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  // 🔹 Initial fetch
  useEffect(() => {
    fetchMessages();
  }, []);

  // 🔹 Listen for new socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      setMessages(prev => [...prev, { ...newMessage, shouldShake: true }]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 65 : 0;

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((item, index) => {
          const isMyMessage = item.senderId === userId;
          const showTimestamp =
            index === 0 ||
            new Date(item.timestamp || '').getTime() -
              new Date(messages[index - 1]?.timestamp || '').getTime() >
              300000;

          return (
            <View key={item._id || index}>
              {showTimestamp && item.timestamp && (
                <View style={styles.timestampContainer}>
                  <Text style={styles.timestampText}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.messageRow,
                  isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
                ]}
              >
                {!isMyMessage && (
                  <Image
                    source={{
                      uri:
                        route.params?.image || 'https://via.placeholder.com/32',
                    }}
                    style={styles.messageAvatar}
                  />
                )}

                {isMyMessage ? (
                  <LinearGradient
                    colors={['#FF6B9D', '#C06C84']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.myMessage]}
                  >
                    <Text style={styles.myMessageText}>{item.message}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.messageBubble, styles.theirMessage]}>
                    <Text style={styles.theirMessageText}>{item.message}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Pressable style={styles.inputIconButton}>
            <Ionicons name="add-circle" size={28} color="#FF6B9D" />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            placeholder="Type a message..."
            style={styles.input}
            multiline
            maxLength={500}
          />

          <Pressable style={styles.inputIconButton}>
            <Ionicons name="image" size={24} color="#666" />
          </Pressable>
        </View>

        <Pressable
          onPress={sendMessage}
          disabled={!message.trim()}
          style={styles.sendButtonContainer}
        >
          <LinearGradient
            colors={
              message.trim() ? ['#FF6B9D', '#C06C84'] : ['#E0E0E0', '#E0E0E0']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? '#FFFFFF' : '#999'}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  backButton: { marginRight: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  headerName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  headerStatus: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  headerIconButton: { padding: 4 },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  timestampContainer: { alignItems: 'center', marginVertical: 16 },
  timestampText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: { borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  myMessageText: { fontSize: 15, color: '#FFFFFF', lineHeight: 20 },
  theirMessageText: { fontSize: 15, color: '#1A1A1A', lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginBottom: Platform.OS === 'ios' ? 0 : 30,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  inputIconButton: { padding: 6 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendButtonContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
});
