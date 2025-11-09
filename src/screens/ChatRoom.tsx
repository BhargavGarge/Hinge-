import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { AuthContext } from '../../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import { useSocketContext } from '../../SocketContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define types
type RootStackParamList = {
  ChatRoom: {
    image: string;
    name: string;
    receiverId: string;
    senderId: string;
  };
};

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChatRoom'
>;

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
  shouldShake?: boolean;
}

const ChatRoom = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const [message, setMessage] = useState<string>('');
  const { userId } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useSocketContext();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {route.params?.name}
          </Text>
        </View>
      ),
      headerRight: () => (
        <Ionicons name="videocam-outline" size={24} color="black" />
      ),
    });
  }, [navigation, route.params?.name]);

  const fetchMessages = async (): Promise<void> => {
    try {
      const senderId = userId;
      const receiverId = route.params?.receiverId;

      if (!senderId || !receiverId) {
        console.log('Missing senderId or receiverId');
        return;
      }

      const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
        params: { senderId, receiverId },
      });

      setMessages(response.data);
    } catch (error) {
      console.log('Error fetching messages', error);
    }
  };

  const sendMessage = async (): Promise<void> => {
    try {
      const senderId = userId;
      const receiverId = route.params?.receiverId;

      if (!message.trim() || !senderId || !receiverId) {
        console.log('Missing message or user IDs');
        return;
      }

      // Clear message input immediately for better UX
      const messageToSend = message;
      setMessage('');

      // Send message to backend
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

      // Refresh messages after a short delay
      setTimeout(() => {
        fetchMessages();
      }, 100);
    } catch (error) {
      console.log('Error sending message', error);
      // Optionally, you could show an error message to the user here
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Socket message listener
    const handleNewMessage = (newMessage: Message) => {
      setMessages(prevMessages => [
        ...prevMessages,
        { ...newMessage, shouldShake: true },
      ]);
    };

    socket?.on('newMessage', handleNewMessage);

    // Cleanup function
    return () => {
      socket?.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 65 : 0;

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {messages?.map((item, index) => (
          <Pressable
            style={[
              item.senderId === userId
                ? {
                    alignSelf: 'flex-end',
                    backgroundColor: '#5b0d63',
                    padding: 10,
                    maxWidth: '60%',
                    borderRadius: 7,
                    margin: 10,
                  }
                : {
                    alignSelf: 'flex-start',
                    backgroundColor: '#e1e3e3',
                    padding: 10,
                    maxWidth: '60%',
                    borderRadius: 7,
                    margin: 10,
                  },
            ]}
            key={item._id || index}
          >
            <Text
              style={{
                fontSize: 15,
                textAlign: 'left',
                letterSpacing: 0.3,
                color: item.senderId === userId ? 'white' : 'black',
              }}
            >
              {item.message}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#dddddd',
          marginBottom: Platform.OS === 'ios' ? 0 : 30,
          gap: 12,
        }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholderTextColor="gray"
          placeholder="Type your message..."
          style={{
            flex: 1,
            borderColor: '#dddddd',
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 10,
            height: 40,
            fontSize: 15,
          }}
          multiline={false}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!message.trim()}
          style={{
            backgroundColor: message.trim() ? '#662d91' : '#cccccc',
            paddingVertical: 8,
            borderRadius: 20,
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: message.trim() ? 'white' : '#666666',
            }}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({});
