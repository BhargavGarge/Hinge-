import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../AuthContext';
import { BASE_URL } from '../url/url';

// Define types for route parameters
type SendLikeRouteParams = {
  type: 'image' | 'prompt';
  image?: string;
  name: string;
  userId: string;
  likedUserId: string;
  prompt?: {
    question: string;
    answer: string;
  };
};

type RootStackParamList = {
  SendLike: SendLikeRouteParams;
  Subscribe: undefined;
};

type SendLikeRouteProp = RouteProp<RootStackParamList, 'SendLike'>;

// Define types for API payloads
interface LikeProfilePayload {
  userId: string;
  likedUserId: string;
  image?: string;
  prompt?: {
    question: string;
    answer: string;
  };
  type: 'image' | 'prompt';
  comment?: string;
}

interface SendRosePayload {
  userId: string;
  likedUserId: string;
  image?: string;
  comment?: string | null;
  type: 'image' | 'prompt';
}

// Define AuthContext type
interface AuthContextType {
  userInfo?: {
    roses?: number;
  };
}

const SendLikeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SendLikeRouteProp>();
  const [comment, setComment] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [profileVisible, setProfileVisible] = useState<boolean>(true);
  const [rose, setRose] = useState<boolean>(false);
  const [profile, setProfile] = useState<boolean>(true);

  const animationValue = new Animated.Value(0);
  const scale = useState(new Animated.Value(1))[0];

  const { userInfo } = useContext(AuthContext) as AuthContextType;

  const likeProfile = async (): Promise<void> => {
    setProfileVisible(prev => !prev);
    setIsAnimating(true);

    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      animationValue.setValue(0);
      setIsAnimating(false);
      setProfileVisible(true);
    });

    try {
      const token = await AsyncStorage.getItem('token');
      const payload: LikeProfilePayload = {
        userId: route.params?.userId || '',
        likedUserId: route.params?.likedUserId || '',
        image: route.params?.image,
        prompt: route.params?.prompt,
        type: route.params?.type || 'image',
      };

      if (comment && comment.trim() !== '') {
        payload.comment = comment.trim();
      }

      const response = await axios.post(`${BASE_URL}/like-profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('response', response);
      if (response.status === 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isAnimating]);

  useEffect(() => {
    if (rose) {
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [rose]);

  const send = async (): Promise<void> => {
    setProfile(prev => !prev);
    setRose(true);

    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      animationValue.setValue(0);
      setRose(false);
      setProfile(true);
    });

    try {
      const token = await AsyncStorage.getItem('token');

      const payload: SendRosePayload = {
        userId: route.params?.userId || '',
        likedUserId: route.params?.likedUserId || '',
        image: route.params?.image,
        comment: comment && comment.trim() !== '' ? comment.trim() : null,
        type: route.params?.type || 'image',
      };

      const response = await axios.post(`${BASE_URL}/send-rose`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log('Rose sent successfully', response.data);
        navigation.goBack();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        navigation.navigate('Subscribe' as never);
      } else {
        console.log('Error', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {profileVisible && (
        <View style={styles.contentContainer}>
          <Text style={styles.nameText}>{route.params?.name}</Text>

          {route.params?.type === 'image' ? (
            <View style={styles.imageContainer}>
              {profile && route.params?.image && (
                <Image
                  style={styles.image}
                  source={{ uri: route.params.image }}
                />
              )}
              {rose && (
                <Animated.View
                  style={[
                    styles.roseAnimationContainer,
                    { transform: [{ scale }] },
                  ]}
                >
                  <LottieView
                    source={require('../../assets/rose.json')}
                    autoPlay
                    loop={true}
                    speed={0.7}
                    style={styles.lottieAnimation}
                  />
                </Animated.View>
              )}
            </View>
          ) : (
            <View style={styles.promptContainer}>
              <Text style={styles.promptQuestion}>
                {route.params?.prompt?.question || ''}
              </Text>
              <Text style={styles.promptAnswer}>
                {route.params?.prompt?.answer || ''}
              </Text>
            </View>
          )}

          <TextInput
            placeholder="Add a comment"
            placeholderTextColor="#666"
            value={comment}
            onChangeText={(text: string) => setComment(text)}
            style={styles.commentInput}
          />

          <View style={styles.buttonsContainer}>
            <Pressable onPress={send} style={styles.roseButton}>
              <Text style={styles.roseCount}>{userInfo?.roses || 0}</Text>
              <Ionicons name="rose" size={22} color="#FD267D" />
            </Pressable>

            <Pressable onPress={likeProfile} style={styles.likeButton}>
              <Text style={styles.likeButtonText}>Send Like</Text>
            </Pressable>
          </View>
        </View>
      )}

      {isAnimating && (
        <View style={styles.animationOverlay}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image
              style={styles.heartIcon}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
              }}
            />
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SendLikeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginHorizontal: 25,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  roseAnimationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    height: 300,
    width: 300,
    alignSelf: 'center',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: 22,
  },
  promptAnswer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 32,
  },
  commentInput: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonsContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F6',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FD267D',
    shadowColor: '#FD267D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roseCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FD267D',
  },
  likeButton: {
    backgroundColor: '#FD267D',
    borderRadius: 25,
    padding: 18,
    flex: 1,
    shadowColor: '#FD267D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  likeButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  heartIcon: {
    width: 80,
    height: 70,
  },
});
