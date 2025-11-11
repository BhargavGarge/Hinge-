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
import { AuthContext } from '../../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import { useSocketContext } from '../../SocketContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Message } from '../../types';

type ChatRoomNavigationProp = NativeStackNavigationProp<any>;
type ChatRoomRouteProp = RouteProp<
  { params: { receiverId: string; name: string; image: string } },
  'params'
>;

const ChatRoom = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const [message, setMessage] = useState<string>('');
  const { userId } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useSocketContext();
  const scrollViewRef = useRef<ScrollView>(null);

  // Route params
  const receiverId = route.params?.receiverId;
  const receiverName = route.params?.name || 'Unknown';
  const receiverImage = route.params?.image || 'https://via.placeholder.com/40';

  // ✅ FIXED HEADER — shows username and back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
          </Pressable>
          <Image source={{ uri: receiverImage }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{receiverName}</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    });
  }, [navigation, receiverName, receiverImage]);

  // Fetch messages - FIXED VERSION
  const fetchMessages = async (): Promise<void> => {
    try {
      if (!receiverId || !userId) {
        console.log('❌ Missing receiverId or userId');
        return;
      }

      console.log('🔍 Fetching messages for:', {
        senderId: userId,
        receiverId,
      });

      // Try the main endpoint first
      const response = await axios.get(`${BASE_URL}/messages`, {
        params: {
          senderId: userId,
          receiverId: receiverId,
        },
      });

      console.log('✅ Messages fetched:', response.data.length);
      setMessages(response.data);

      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log('❌ Error fetching messages from /messages:', error);

      // Fallback: try the alternative endpoint
      try {
        console.log('🔄 Trying fallback endpoint...');
        const fallbackResponse = await axios.get(
          `${BASE_URL}/messages/${receiverId}`,
          {
            params: {
              senderId: userId,
            },
          },
        );

        console.log('✅ Messages from fallback:', fallbackResponse.data.length);
        setMessages(fallbackResponse.data);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (fallbackError) {
        console.log('❌ Error with fallback endpoint:', fallbackError);
      }
    }
  };

  // Send message - FIXED VERSION
  const sendMessage = async (): Promise<void> => {
    try {
      const senderId = userId;
      if (!message.trim() || !senderId || !receiverId) {
        console.log('❌ Missing required fields for sending message');
        return;
      }

      const messageToSend = message.trim();

      // Create temporary message for immediate UI update
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        senderId: senderId,
        receiverId: receiverId,
        message: messageToSend,
        timestamp: new Date().toISOString(),
      };

      // Immediately update UI with temporary message
      setMessages(prev => [...prev, tempMessage]);
      setMessage('');

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);

      // Send to backend
      console.log('📤 Sending message:', messageToSend);
      await axios.post(`${BASE_URL}/sendMessage`, {
        senderId,
        receiverId,
        message: messageToSend,
      });

      // Emit socket event
      socket?.emit('sendMessage', {
        senderId,
        receiverId,
        message: messageToSend,
      });

      // Refresh messages to get the actual message from DB (replaces temp message)
      setTimeout(() => {
        fetchMessages();
      }, 200);
    } catch (error) {
      console.log('❌ Error sending message', error);
      // Remove temporary message if sending failed
      setMessages(prev => prev.filter(msg => !msg._id?.startsWith('temp-')));
    }
  };

  useEffect(() => {
    if (receiverId && userId) {
      console.log('🚀 Initial message fetch');
      fetchMessages();
    }
  }, [receiverId, userId]);

  // Socket event listeners - FIXED VERSION
  useEffect(() => {
    console.log('🔌 Setting up socket listeners');

    const handleNewMessage = (newMessage: Message) => {
      console.log('📨 New message via socket:', newMessage);

      // Check if this message is for current chat
      if (
        (newMessage.senderId === receiverId &&
          newMessage.receiverId === userId) ||
        (newMessage.senderId === userId && newMessage.receiverId === receiverId)
      ) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(
            msg =>
              msg._id === newMessage._id ||
              (msg.message === newMessage.message &&
                msg.timestamp === newMessage.timestamp),
          );

          if (!exists) {
            return [...prev, newMessage];
          }
          return prev;
        });

        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    const handleReceiveMessage = (data: {
      senderId: string;
      message: string;
    }) => {
      console.log('📨 Received message via socket:', data);

      if (data.senderId === receiverId) {
        const newMessage: Message = {
          _id: `socket-${Date.now()}`,
          senderId: data.senderId,
          receiverId: userId,
          message: data.message,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMessage]);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    // Listen for both events
    socket?.on('newMessage', handleNewMessage);
    socket?.on('receiveMessage', handleReceiveMessage);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket?.off('newMessage', handleNewMessage);
      socket?.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, receiverId, userId]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return '';
    }
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

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
        onContentSizeChange={() => {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
      >
        {messages?.map((item, index) => {
          const isMyMessage = item.senderId === userId;
          const isTempMessage = item._id?.startsWith('temp-');

          return (
            <View
              key={item._id || `msg-${index}`}
              style={[
                styles.messageRow,
                isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
              ]}
            >
              {!isMyMessage && (
                <Image
                  source={{ uri: receiverImage }}
                  style={styles.messageAvatar}
                />
              )}

              <View style={styles.messageContent}>
                {isMyMessage ? (
                  <LinearGradient
                    colors={['#FF6B9D', '#C06C84']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.myMessage]}
                  >
                    <Text style={styles.myMessageText}>{item.message}</Text>
                    {item.timestamp && (
                      <Text style={styles.timestampText}>
                        {formatTime(item.timestamp)}
                      </Text>
                    )}
                    {isTempMessage && (
                      <View style={styles.sendingIndicator}>
                        <Text style={styles.sendingText}>Sending...</Text>
                      </View>
                    )}
                  </LinearGradient>
                ) : (
                  <View style={[styles.messageBubble, styles.theirMessage]}>
                    <Text style={styles.theirMessageText}>{item.message}</Text>
                    {item.timestamp && (
                      <Text style={styles.timestampText}>
                        {formatTime(item.timestamp)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        )}
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
            onSubmitEditing={sendMessage}
            returnKeyType="send"
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
  backButton: {
    marginRight: 4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
  },
  messageBubble: {
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  myMessage: {
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  theirMessageText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sendingIndicator: {
    marginTop: 4,
  },
  sendingText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginBottom: Platform.OS === 'ios' ? 0 : 70,
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
  inputIconButton: {
    padding: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendButtonContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
});
