import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { BASE_URL } from '../url/url';
import axios from 'axios';

// Define types for better TypeScript support
interface User {
  userId: string;
  email: string;
  firstName: string;
  gender: string;
  location: string;
  lookingFor: string;
  dateOfBirth: string;
  hometown: string;
  type: string;
  jobTitle: string;
  workPlace: string;
  imageUrls: string[];
  prompts: any[];
}

interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Define navigation type to fix TypeScript errors
type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { userId, setUserId, token, setToken, userInfo, setUserInfo } =
    useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [currentProfile, setCurrentProfile] = useState<User | null>(null);
  const [option, setOption] = useState('Age');
  const [isAnimating, setIsAnimating] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [dislikedProfiles, setDislikedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const animationValue = new Animated.Value(0);
  const scale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        // Type guard to check if token exists
        if (!token) {
          console.log('No token found');
          return;
        }

        // Explicitly type the decoded token
        const decodedToken = jwtDecode<JwtPayload>(token);
        const userId = decodedToken.userId;

        // Check if userId exists before setting
        if (userId) {
          setUserId(userId);
        } else {
          console.log('No userId found in token');
        }
      } catch (error) {
        console.log('Error decoding token:', error);
      }
    };

    fetchUser();
  }, [setUserId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchMatches();
      }
    }, [userId]),
  );

  useEffect(() => {
    if (users.length > 0) {
      setCurrentProfile(users[0]);
    }
  }, [users]);

  const fetchMatches = async () => {
    try {
      // Ensure userId is not null/undefined before making the request
      if (!userId) {
        console.log('No userId available');
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/matches?userId=${encodeURIComponent(userId)}`,
      );

      const matches: User[] = response.data.matches;
      setUsers(matches);

      // Set current profile if matches exist
      if (matches.length > 0) {
        setCurrentProfile(matches[0]);
      }
    } catch (error) {
      console.log('Error fetching matches', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, marginTop: 55 }}>
      {/* Filter Options */}
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#D0D0D0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="sparkles-sharp" size={22} color="black" />
        </Pressable>

        <Pressable
          onPress={() => setOption('Age')}
          style={{
            borderColor: option === 'Age' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: option === 'Age' ? 'black' : 'transparent',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '400',
              color: option === 'Age' ? 'white' : '#808080',
            }}
          >
            Age
          </Text>
        </Pressable>

        <Pressable
          style={{
            borderColor: option === 'Height' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: option === 'Height' ? 'black' : 'transparent',
          }}
          onPress={() => setOption('Height')}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '400',
              color: option === 'Height' ? 'white' : '#808080',
            }}
          >
            Height
          </Text>
        </Pressable>

        <Pressable
          style={{
            borderColor:
              option === 'Dating Intention' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor:
              option === 'Dating Intention' ? 'black' : 'transparent',
          }}
          onPress={() => setOption('Dating Intention')}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '400',
              color: option === 'Dating Intention' ? 'white' : '#808080',
            }}
          >
            Dating Intention
          </Text>
        </Pressable>

        <Pressable
          style={{
            borderColor: option === 'Nearby' ? 'transparent' : '#808080',
            borderWidth: 0.7,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: option === 'Nearby' ? 'black' : 'transparent',
          }}
          onPress={() => setOption('Nearby')}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: '400',
              color: option === 'Nearby' ? 'white' : '#808080',
            }}
          >
            Nearby
          </Text>
        </Pressable>
      </View>

      {/* Profile Section */}
      <View style={{ marginHorizontal: 12, marginVertical: 12 }}>
        {/* Profile Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
              {currentProfile?.firstName || 'No profile'}
            </Text>
            <View
              style={{
                backgroundColor: '#452c63',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white' }}>
                new here
              </Text>
            </View>
          </View>
          <View>
            <Ionicons name="ellipsis-horizontal" size={22} color="black" />
          </View>
        </View>

        {/* Profile Image */}
        <View style={{ marginVertical: 15 }}>
          {currentProfile?.imageUrls && currentProfile.imageUrls.length > 0 ? (
            <View>
              <Image
                style={{
                  width: '100%',
                  height: 410,
                  resizeMode: 'cover',
                  borderRadius: 10,
                }}
                source={{ uri: currentProfile.imageUrls[0] }}
              />
              <Pressable
                onPress={() =>
                  navigation.navigate('SendLike', {
                    type: 'image',
                    image: currentProfile.imageUrls[0],
                    name: currentProfile.firstName,
                    userId: userId,
                    likedUserId: currentProfile.userId,
                  })
                }
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  backgroundColor: 'white',
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: 'contain',
                  }}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                  }}
                />
              </Pressable>
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                height: 410,
                backgroundColor: '#D0D0D0',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>No image available</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ marginVertical: 15 }}>
        {currentProfile?.prompts?.slice(0, 1).map((prompt, index) => (
          <>
            <View
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 10,
                height: 150,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '500' }}>
                {prompt.question}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginTop: 20,
                  fontFamily: 'Carlito',
                  lineHeight: 30,
                }}
              >
                {prompt.answer}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate('SendLike', {
                  type: 'prompt',
                  name: currentProfile?.firstName,
                  userId: userId,
                  likedUserId: currentProfile?.userId,
                  prompt: {
                    question: prompt.question,
                    answer: prompt.answer,
                  },
                })
              }
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'white',
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                }}
              />
            </Pressable>
          </>
        ))}
      </View>
      <View
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 8,
        }}
      >
        {' '}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 0.8,
            borderBlockColor: '#E0E0E0',
            paddingBottom: 10,
          }}
        >
          {' '}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ marginRight: 20 }}>
              <Text style={{ fontSize: 15 }}>
                {currentProfile?.dateOfBirth}
              </Text>
            </View>
            <View style={{ marginRight: 20 }}>
              <Text style={{ fontSize: 15 }}>{currentProfile?.gender}</Text>
            </View>

            <View style={{ marginRight: 20 }}>
              <Text style={{ fontSize: 15 }}>{currentProfile?.type}</Text>
            </View>
            <View style={{ marginRight: 20 }}>
              <Text style={{ fontSize: 15 }}>{currentProfile?.hometown}</Text>
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="bag-outline" size={20} color="black" />
          <Text>{currentProfile?.jobTitle}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="locate-outline" size={20} color="black" />
          <Text>{currentProfile?.workPlace}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="book-outline" size={20} color="black" />
          <Text>Hindu</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="home-outline" size={20} color="black" />
          <Text>{currentProfile?.location}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="search-outline" size={20} color="black" />
          <Text>{currentProfile?.lookingFor}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 15,
            borderBottomColor: '#E0E0E0',
            paddingBottom: 10,
            borderBottomWidth: 0.8,
          }}
        >
          <Ionicons name="heart-outline" size={20} color="black" />
          <Text>Monogamy</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
});
