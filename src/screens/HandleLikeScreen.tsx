import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import React, { useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL } from '../url/url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';

const { width } = Dimensions.get('window');

interface Like {
  userId: string;
  type: 'prompt' | 'image';
  comment?: string;
  prompt?: {
    question: string;
    answer: string;
  };
  image?: string;
  user: {
    userId: string;
    firstName: string;
    imageUrls: string[];
    prompts: Array<{
      question: string;
      answer: string;
    }>;
  };
  timestamp?: string;
}

interface RouteParams {
  user?: {
    userId: string;
    firstName: string;
    imageUrls: string[];
    prompts: Array<{
      question: string;
      answer: string;
    }>;
  };
  like?: Like;
  onMatchSuccess?: () => void;
  name?: string;
  imageUrls?: string[];
  prompts?: Array<{
    id?: string;
    question: string;
    answer: string;
  }>;
  userId?: string;
  selectedUserId?: string;
}

const HandleLikeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route?.params as RouteParams;
  const { userId } = useContext(AuthContext);

  const handleBack = () => {
    navigation.goBack();
  };

  const createMatch = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const currentUserId = userId;
      const selectedUserId = params?.user?.userId || params?.like?.userId;

      if (!currentUserId || !selectedUserId) {
        Alert.alert('Error', 'User information is missing');
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/create-match`,
        {
          currentUserId,
          selectedUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Match created successfully!');
        // Call the success callback if provided
        params?.onMatchSuccess?.();
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error', error);
      Alert.alert('Error', 'Failed to create match');
    }
  };

  const match = () => {
    const userName =
      params?.user?.firstName || params?.like?.user?.firstName || 'this user';
    Alert.alert('Accept Request?', `Match with ${userName}?`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => createMatch() },
    ]);
  };

  // Get the like data from either params.like or convert old format
  const like = params?.like;
  const user = params?.user || like?.user;

  if (!user || !like) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Convert single like to interactions array for compatibility
  const interactions = [
    {
      type: like.type,
      comment: like.comment,
      prompt: like.prompt,
      image: like.image,
    },
  ];

  // Safe access to route params with fallbacks
  const userName = user.firstName;
  const imageUrls = user.imageUrls || [];
  const prompts = user.prompts || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButtonTop}>
          <View style={styles.backIconCircle}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>

        {/* User Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: user.imageUrls?.[0] || 'https://via.placeholder.com/150',
              }}
              style={styles.profileImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.firstName}</Text>
            <View style={styles.interactionBadge}>
              <View style={styles.heartIcon}>
                <Text style={styles.heartEmoji}>❤️</Text>
              </View>
              <Text style={styles.interactionText}>
                Liked your {like.type === 'prompt' ? 'prompt' : 'photo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactions Cards */}
        <View style={styles.interactionsContainer}>
          {interactions.map((interaction, index) => (
            <View key={index} style={styles.interactionCard}>
              {/* Photo Like */}
              {interaction.type === 'image' && interaction.image && (
                <View style={styles.photoLikeContainer}>
                  <View style={styles.interactionTypeHeader}>
                    <LinearGradient
                      colors={['#FF6B9D', '#FF8FB3']}
                      style={styles.typeIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.typeIcon}>📸</Text>
                    </LinearGradient>
                    <View style={styles.typeTextContainer}>
                      <Text style={styles.typeTitle}>Liked your photo</Text>
                      <Text style={styles.typeSubtitle}>
                        {user.firstName} liked this photo
                      </Text>
                    </View>
                  </View>

                  <Image
                    source={{ uri: interaction.image }}
                    style={styles.likedPhotoImage}
                  />

                  {interaction.comment && (
                    <View style={styles.commentBubble}>
                      <View style={styles.commentHeader}>
                        <Image
                          source={{
                            uri:
                              user.imageUrls?.[0] ||
                              'https://via.placeholder.com/30',
                          }}
                          style={styles.commentAvatar}
                        />
                        <Text style={styles.commentName}>{user.firstName}</Text>
                      </View>
                      <Text style={styles.commentText}>
                        "{interaction.comment}"
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Prompt Like */}
              {interaction.type === 'prompt' && interaction.prompt && (
                <View style={styles.promptLikeContainer}>
                  <View style={styles.interactionTypeHeader}>
                    <LinearGradient
                      colors={['#A78BFA', '#C4B5FD']}
                      style={styles.typeIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.typeIcon}>💬</Text>
                    </LinearGradient>
                    <View style={styles.typeTextContainer}>
                      <Text style={styles.typeTitle}>Liked your answer</Text>
                      <Text style={styles.typeSubtitle}>
                        {user.firstName} liked your prompt
                      </Text>
                    </View>
                  </View>

                  <View style={styles.promptCard}>
                    <Text style={styles.promptQuestion}>
                      {interaction.prompt.question}
                    </Text>
                    <Text style={styles.promptAnswer}>
                      {interaction.prompt.answer}
                    </Text>
                  </View>

                  {interaction.comment && (
                    <View style={styles.commentBubble}>
                      <View style={styles.commentHeader}>
                        <Image
                          source={{
                            uri:
                              user.imageUrls?.[0] ||
                              'https://via.placeholder.com/30',
                          }}
                          style={styles.commentAvatar}
                        />
                        <Text style={styles.commentName}>{user.firstName}</Text>
                      </View>
                      <Text style={styles.commentText}>
                        "{interaction.comment}"
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* User Profile Details Section */}
        <View style={styles.profileDetailsSection}>
          <View style={styles.profileHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>new here</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileContent}>
            {/* First Image */}
            {imageUrls.length > 0 && (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.profileImageLarge}
                  source={{
                    uri: imageUrls[0],
                  }}
                />
                <Pressable style={styles.imageIcon}>
                  <Image
                    style={styles.iconImage}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                    }}
                  />
                </Pressable>
              </View>
            )}

            {/* First Prompt */}
            <View style={styles.promptContainer}>
              {prompts.slice(0, 1).map((prompt, index) => (
                <View key={index} style={styles.promptWrapper}>
                  <View style={styles.promptCardLarge}>
                    <Text style={styles.promptQuestionLarge}>
                      {prompt.question}
                    </Text>
                    <Text style={styles.promptAnswerLarge}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View style={styles.promptIcon}>
                    <Image
                      style={styles.iconImage}
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Second and Third Images */}
            {imageUrls.slice(1, 3).map((item, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  style={styles.profileImageLarge}
                  source={{
                    uri: item,
                  }}
                />
                <View style={styles.imageIcon}>
                  <Image
                    style={styles.iconImage}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                    }}
                  />
                </View>
              </View>
            ))}

            {/* Second Prompt */}
            <View style={styles.promptContainer}>
              {prompts.slice(1, 2).map((prompt, index) => (
                <View key={index} style={styles.promptWrapper}>
                  <View style={styles.promptCardLarge}>
                    <Text style={styles.promptQuestionLarge}>
                      {prompt.question}
                    </Text>
                    <Text style={styles.promptAnswerLarge}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View style={styles.promptIcon}>
                    <Image
                      style={styles.iconImage}
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Fourth Image */}
            {imageUrls.slice(3, 4).map((item, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  style={styles.profileImageLarge}
                  source={{
                    uri: item,
                  }}
                />
                <View style={styles.imageIcon}>
                  <Image
                    style={styles.iconImage}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                    }}
                  />
                </View>
              </View>
            ))}

            {/* Third Prompt */}
            <View style={styles.promptContainer}>
              {prompts.slice(2, 3).map((prompt, index) => (
                <View key={index} style={styles.promptWrapper}>
                  <View style={styles.promptCardLarge}>
                    <Text style={styles.promptQuestionLarge}>
                      {prompt.question}
                    </Text>
                    <Text style={styles.promptAnswerLarge}>
                      {prompt.answer}
                    </Text>
                  </View>
                  <View style={styles.promptIcon}>
                    <Image
                      style={styles.iconImage}
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Remaining Images (5th to 7th) */}
            {imageUrls.slice(4, 7).map((item, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  style={styles.profileImageLarge}
                  source={{
                    uri: item,
                  }}
                />
                <View style={styles.imageIcon}>
                  <Image
                    style={styles.iconImage}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2724/2724657.png',
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={match}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF8FB3']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                ❤️ Match {user.firstName}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Keep all the same styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  backButtonTop: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  heroSection: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  interactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heartIcon: {
    marginRight: 8,
  },
  heartEmoji: {
    fontSize: 16,
  },
  interactionText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  interactionsContainer: {
    padding: 20,
  },
  interactionCard: {
    marginBottom: 16,
  },
  photoLikeContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptLikeContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  interactionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 18,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  typeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  likedPhotoImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  commentBubble: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  commentText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  profileDetailsSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileContent: {
    marginVertical: 15,
  },
  imageContainer: {
    marginVertical: 10,
    position: 'relative',
  },
  profileImageLarge: {
    width: '100%',
    height: 410,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  imageIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  promptContainer: {
    marginVertical: 15,
  },
  promptWrapper: {
    position: 'relative',
  },
  promptCardLarge: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    minHeight: 150,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  promptQuestionLarge: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  promptAnswerLarge: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 24,
  },
  promptIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default HandleLikeScreen;
