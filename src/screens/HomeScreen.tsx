import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');

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

  // Safe text rendering helper function
  const renderText = (content: any, style: any = {}) => {
    return (
      <Text style={[styles.defaultText, style]}>
        {content || 'Not specified'}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.defaultText}>Loading profiles...</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, styles.defaultText]}>
          No profiles available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <Pressable style={styles.filterIcon}>
          <Ionicons name="sparkles-sharp" size={22} color="black" />
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <Pressable
            onPress={() => setOption('Age')}
            style={[
              styles.filterButton,
              option === 'Age' && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Age' && styles.activeFilterText,
              ]}
            >
              Age
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              option === 'Height' && styles.activeFilterButton,
            ]}
            onPress={() => setOption('Height')}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Height' && styles.activeFilterText,
              ]}
            >
              Height
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              option === 'Dating Intention' && styles.activeFilterButton,
            ]}
            onPress={() => setOption('Dating Intention')}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Dating Intention' && styles.activeFilterText,
              ]}
            >
              Dating Intention
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              option === 'Nearby' && styles.activeFilterButton,
            ]}
            onPress={() => setOption('Nearby')}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Nearby' && styles.activeFilterText,
              ]}
            >
              Nearby
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              option === 'Interests' && styles.activeFilterButton,
            ]}
            onPress={() => setOption('Interests')}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Interests' && styles.activeFilterText,
              ]}
            >
              Interests
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              option === 'Verified' && styles.activeFilterButton,
            ]}
            onPress={() => setOption('Verified')}
          >
            <Text
              style={[
                styles.filterText,
                option === 'Verified' && styles.activeFilterText,
              ]}
            >
              Verified
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.nameContainer}>
            {renderText(currentProfile?.firstName, styles.profileName)}
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>new here</Text>
            </View>
          </View>
          <View>
            <Ionicons name="ellipsis-horizontal" size={22} color="black" />
          </View>
        </View>

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {currentProfile?.imageUrls && currentProfile.imageUrls.length > 0 ? (
            <View>
              <Image
                style={styles.profileImage}
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
                style={styles.likeButton}
              >
                <Image
                  style={styles.likeIcon}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                  }}
                />
              </Pressable>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.defaultText}>No image available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Prompts Section */}
      <View style={styles.promptsContainer}>
        {currentProfile?.prompts?.slice(0, 1).map((prompt, index) => (
          <View key={index} style={styles.promptCard}>
            <View style={styles.promptContent}>
              {renderText(prompt?.question, styles.promptQuestion)}
              {renderText(prompt?.answer, styles.promptAnswer)}
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate('SendLike', {
                  type: 'prompt',
                  name: currentProfile?.firstName,
                  userId: userId,
                  likedUserId: currentProfile?.userId,
                  prompt: {
                    question: prompt?.question,
                    answer: prompt?.answer,
                  },
                })
              }
              style={styles.promptLikeButton}
            >
              <Image
                style={styles.likeIcon}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                }}
              />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.detailsScrollContent}
          >
            <View style={styles.detailItem}>
              {renderText(currentProfile?.dateOfBirth, styles.detailText)}
            </View>
            <View style={styles.detailItem}>
              {renderText(currentProfile?.gender, styles.detailText)}
            </View>
            <View style={styles.detailItem}>
              {renderText(currentProfile?.type, styles.detailText)}
            </View>
            <View style={styles.detailItem}>
              {renderText(currentProfile?.hometown, styles.detailText)}
            </View>
            <View style={styles.detailItem}>
              {renderText(currentProfile?.jobTitle, styles.detailText)}
            </View>
            <View style={styles.detailItem}>
              {renderText('5\'7"', styles.detailText)}
            </View>
          </ScrollView>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="bag-outline" size={20} color="black" />
          {renderText(currentProfile?.jobTitle)}
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="locate-outline" size={20} color="black" />
          {renderText(currentProfile?.workPlace)}
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={20} color="black" />
          <Text style={styles.defaultText}>Hindu</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={20} color="black" />
          {renderText(currentProfile?.location)}
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="search-outline" size={20} color="black" />
          {renderText(currentProfile?.lookingFor)}
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="heart-outline" size={20} color="black" />
          <Text style={styles.defaultText}>Monogamy</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 55,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  defaultText: {
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  filterContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
  },
  filterScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 20,
  },
  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    borderColor: '#808080',
    borderWidth: 0.7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  activeFilterButton: {
    backgroundColor: 'black',
    borderColor: 'transparent',
  },
  filterText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  activeFilterText: {
    color: 'white',
  },
  profileContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    backgroundColor: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  newBadge: {
    backgroundColor: '#452c63',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadgeText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
  },
  imageContainer: {
    marginVertical: 15,
  },
  profileImage: {
    width: '100%',
    height: 410,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  noImageContainer: {
    width: '100%',
    height: 410,
    backgroundColor: '#D0D0D0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptsContainer: {
    marginVertical: 15,
    marginHorizontal: 12,
  },
  promptCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    minHeight: 150,
    justifyContent: 'center',
  },
  promptContent: {
    flex: 1,
  },
  promptQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
  },
  promptAnswer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Carlito',
    lineHeight: 30,
    color: 'black',
  },
  promptLikeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  detailsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.8,
    borderBlockColor: '#E0E0E0',
    paddingBottom: 10,
    minHeight: 40,
  },
  detailsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  detailItem: {
    marginRight: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 15,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    borderBottomWidth: 0.8,
  },
});
