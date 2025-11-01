'use client';

import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../url/url';
import { AuthContext } from '../../AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Like {
  userId: string;
  type: string; // "prompt" or "image"
  comment?: string;
  prompt?: {
    question: string;
    answer: string;
  };
  image?: string; // The specific image that was liked
  user: {
    userId: string;
    firstName: string;
    imageUrls: string[];
    prompts: Array<{
      question: string;
      answer: string;
    }>;
  };
}

const LikesScreen = () => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Recent');
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    fetchReceivedLikes();
  }, []);

  const fetchReceivedLikes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/received-likes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikes(response.data.receivedLikes || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFeaturedLike = () => {
    if (likes.length === 0) return null;
    const featured = likes[0];

    const displayImage =
      featured.type === 'image'
        ? featured.image
        : featured.user.imageUrls[0] || 'https://via.placeholder.com/400x600';

    return (
      <TouchableOpacity style={styles.featuredCard} activeOpacity={0.95}>
        <Image source={{ uri: displayImage }} style={styles.featuredImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>NEW</Text>
            </View>
            <Text style={styles.featuredName}>
              {featured.user.firstName.trim()}
            </Text>
            {featured.comment && (
              <Text style={styles.featuredComment} numberOfLines={2}>
                "{featured.comment}"
              </Text>
            )}
            {featured.type === 'prompt' && featured.prompt && (
              <View style={styles.promptContainer}>
                <Text style={styles.promptQuestion} numberOfLines={1}>
                  {featured.prompt.question}
                </Text>
                <Text style={styles.promptAnswer} numberOfLines={2}>
                  {featured.prompt.answer}
                </Text>
              </View>
            )}
            {featured.type === 'image' && (
              <View style={styles.likeTypeIndicator}>
                <Text style={styles.likeTypeText}>❤️ Liked your photo</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderLikeCard = ({ item, index }: { item: Like; index: number }) => {
    if (index === 0) return null; // Skip first item as it's featured

    const displayImage =
      item.type === 'image'
        ? item.image
        : item.user.imageUrls[0] || 'https://via.placeholder.com/300x400';

    return (
      <TouchableOpacity style={styles.likeCard} activeOpacity={0.9}>
        <Image source={{ uri: displayImage }} style={styles.likeImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.likeGradient}
        >
          <View style={styles.likeContent}>
            <Text style={styles.likeName} numberOfLines={1}>
              {item.user.firstName.trim()}
            </Text>
            {item.comment && (
              <Text style={styles.likeComment} numberOfLines={2}>
                {item.comment}
              </Text>
            )}
            {item.type === 'prompt' && item.prompt && (
              <Text style={styles.likeTypeSmall} numberOfLines={1}>
                💬 {item.prompt.question}
              </Text>
            )}
            {item.type === 'image' && (
              <Text style={styles.likeTypeSmall}>❤️ Photo</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💫</Text>
      </View>
      <Text style={styles.emptyTitle}>No Likes Yet</Text>
      <Text style={styles.emptySubtitle}>
        When someone likes you, they'll appear here
      </Text>

      <TouchableOpacity style={styles.boostButton}>
        <LinearGradient
          colors={['#FF6B9D', '#C06C84']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.boostGradient}
        >
          <Text style={styles.boostButtonText}>Get More Likes</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips to get more likes:</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Add more photos to your profile</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Answer prompts authentically</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Be active and like others</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading your likes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Likes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{selectedFilter}</Text>
            <Text style={styles.filterIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {likes.length === 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item, index) => `${item.userId}-${index}`}
          ListHeaderComponent={
            <View>
              {renderFeaturedLike()}

              {/* Boost Banner */}
              <View style={styles.boostBanner}>
                <LinearGradient
                  colors={['#FF6B9D', '#C06C84']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.boostBannerGradient}
                >
                  <View style={styles.boostBannerContent}>
                    <Text style={styles.boostBannerTitle}>
                      🚀 Boost Your Profile
                    </Text>
                    <Text style={styles.boostBannerSubtitle}>
                      Get 10x more likes today
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.boostBannerButton}>
                    <Text style={styles.boostBannerButtonText}>Try Now</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Likes</Text>
                <Text style={styles.sectionCount}>{likes.length - 1}</Text>
              </View>
            </View>
          }
          renderItem={renderLikeCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 4,
  },
  filterIcon: {
    fontSize: 10,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  featuredCard: {
    width: width - 32,
    height: 500,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 16,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredContent: {
    marginBottom: 8,
  },
  featuredBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuredName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredComment: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    lineHeight: 22,
  },
  promptContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  promptQuestion: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  promptAnswer: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  likeTypeIndicator: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  likeTypeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  boostBanner: {
    width: width - 32,
    alignSelf: 'center',
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  boostBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  boostBannerContent: {
    flex: 1,
  },
  boostBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  boostBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  boostBannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  boostBannerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  likeCard: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  likeImage: {
    width: '100%',
    height: '100%',
  },
  likeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  likeContent: {
    marginBottom: 4,
  },
  likeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  likeComment: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    marginBottom: 4,
  },
  likeTypeSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  boostButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  boostGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  boostButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#FF6B9D',
    marginRight: 8,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LikesScreen;
