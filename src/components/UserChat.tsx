import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ChatRoom: {
    image: string;
    name: string;
    receiverId: string;
    senderId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;
import { useSocketContext } from '../../SocketContext';
import axios from 'axios';
import { BASE_URL } from '../url/url';

// Basic types without navigation typing
interface User {
  userId: string;
  firstName: string;
  imageUrls: string[];
}

interface Message {
  message: string;
  senderId: string;
  receiverId: string;
  timestamp?: string;
}

interface UserChatProps {
  item: User;
  userId: string;
}

const UserChat = ({ item, userId }: UserChatProps) => {
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const navigation = useNavigation();
  const { socket } = useSocketContext();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const senderId = userId;
      const receiverId = item?.userId;

      const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
        params: { senderId, receiverId },
      });

      setMessages(response.data);
      setLastMessage(response.data[response.data.length - 1]);
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate(
          'ChatRoom' as never,
          {
            image: item?.imageUrls[0],
            name: item?.firstName,
            receiverId: item?.userId,
            senderId: userId,
          } as never,
        )
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 12,
      }}
    >
      <View>
        <Image
          style={{ width: 70, height: 70, borderRadius: 35 }}
          source={{ uri: item?.imageUrls[0] }}
        />
      </View>

      <View>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            fontFamily: 'GeezaPro-Bold',
          }}
        >
          {item?.firstName}
        </Text>

        <Text style={{ fontWeight: '500', fontSize: 15, marginTop: 6 }}>
          {lastMessage
            ? lastMessage?.message
            : `Start Chat with ${item?.firstName}`}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
