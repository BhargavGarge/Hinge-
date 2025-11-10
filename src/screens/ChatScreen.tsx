'use client';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import LinearGradient from 'react-native-linear-gradient';
import UserChat from '../components/UserChat';

// Define types
export interface Match {
  userId: string;
  firstName?: string;
  imageUrls?: string[];
  prompts?: any[];
}

export interface Message {
  senderId: string;
  receiverId?: string;
  message?: string;
  timestamp?: string;
}

export interface ChatItem extends Match {
  lastMessage?: Message | null;
}

interface CategorizedChats {
  yourTurn: ChatItem[];
  theirTurn: ChatItem[];
}

const ChatScreen = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { userId } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [categorizedChats, setCategorizedChats] = useState<CategorizedChats>({
    yourTurn: [],
    theirTurn: [],
  });

  const fetchMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get(`${BASE_URL}/get-matches/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Matches response:', response.data);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.log('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndCategorizeChats = async () => {
    if (!matches.length) {
      setCategorizedChats({ yourTurn: [], theirTurn: [] });
      return;
    }

    const yourTurn: ChatItem[] = [];
    const theirTurn: ChatItem[] = [];

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await Promise.all(
        matches.map(async (item: Match) => {
          try {
            const response = await axios.get<Message[]>(
              `${BASE_URL}/messages`,
              {
                params: {
                  senderId: userId,
                  receiverId: item.userId,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const messages = response.data || [];
            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : null;

            const chatItem: ChatItem = {
              ...item,
              lastMessage,
            };

            if (lastMessage?.senderId === userId) {
              theirTurn.push(chatItem);
            } else {
              yourTurn.push(chatItem);
            }
          } catch (error) {
            console.log(
              'Error fetching messages for user:',
              item.userId,
              error,
            );
            yourTurn.push({ ...item });
          }
        }),
      );

      setCategorizedChats({ yourTurn, theirTurn });
    } catch (error) {
      console.log('Error categorizing chats:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMatches();
    }
  }, [userId]);

  useEffect(() => {
    if (matches.length > 0) {
      fetchAndCategorizeChats();
    } else {
      setCategorizedChats({ yourTurn: [], theirTurn: [] });
    }
  }, [matches]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading your chats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {categorizedChats.yourTurn.length +
              categorizedChats.theirTurn.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {matches.length > 0 ? (
          <View style={styles.matchesContainer}>
            {/* Your Turn Section */}
            {categorizedChats.yourTurn.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Your Turn</Text>
                    <View style={styles.turnIndicator}>
                      <View style={styles.turnDot} />
                    </View>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {categorizedChats.yourTurn.length}
                    </Text>
                  </View>
                </View>
                {categorizedChats.yourTurn.map((item, index) => (
                  <UserChat
                    key={item.userId || index.toString()}
                    item={item}
                    userId={userId!}
                  />
                ))}
              </View>
            )}

            {/* Their Turn Section */}
            {categorizedChats.theirTurn.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Their Turn</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {categorizedChats.theirTurn.length}
                    </Text>
                  </View>
                </View>
                {categorizedChats.theirTurn.map((item, index) => (
                  <UserChat
                    key={item.userId || index.toString()}
                    item={item}
                    userId={userId!}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            {/* Empty State Illustration */}
            <View style={styles.emptyIllustration}>
              <LinearGradient
                colors={['#FFE8F0', '#FFF5F8']}
                style={styles.emptyCircle}
              >
                <Text style={styles.emptyIcon}>💬</Text>
              </LinearGradient>
            </View>

            {/* Empty State Content */}
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>No Matches Yet</Text>
              <Text style={styles.emptySubtitle}>
                Matches are more meaningful on Hinge.{'\n'}
                We can help improve your chances
              </Text>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Get More Matches</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipIconContainer}>
                    <Text style={styles.tipIcon}>📸</Text>
                  </View>
                  <Text style={styles.tipText}>Add high-quality photos</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIconContainer}>
                    <Text style={styles.tipIcon}>💭</Text>
                  </View>
                  <Text style={styles.tipText}>Complete your prompts</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIconContainer}>
                    <Text style={styles.tipIcon}>❤️</Text>
                  </View>
                  <Text style={styles.tipText}>
                    Be active and like profiles
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.emptyActions}>
              <Pressable style={styles.boostButton}>
                <LinearGradient
                  colors={['#FF6B9D', '#C06C84']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.boostGradient}
                >
                  <Text style={styles.boostButtonText}>Boost Your Profile</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
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
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
  },
  headerBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  matchesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  turnIndicator: {
    backgroundColor: '#FFE8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B9D',
  },
  countBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyIllustration: {
    marginBottom: 32,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  tipsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  boostButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
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
  upgradeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});

export default ChatScreen;
