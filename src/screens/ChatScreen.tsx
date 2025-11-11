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
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import LinearGradient from 'react-native-linear-gradient';
import UserChat from '../components/UserChat';
import { useSocketContext } from '../../SocketContext';

// Define types
export interface Match {
  userId: string;
  firstName?: string;
  imageUrls?: string[];
  prompts?: any[];
}

export interface Message {
  _id?: string;
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
  const { socket } = useSocketContext();
  const isFocused = useIsFocused();

  const fetchMatches = async () => {
    try {
      console.log('🔍 Fetching matches for user:', userId);
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

      console.log('✅ Matches response:', response.data);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.log('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };
  // In ChatScreen.tsx - update the fetchAndCategorizeChats function
  const fetchAndCategorizeChats = async () => {
    if (!matches.length) {
      console.log('ℹ️ No matches to categorize');
      setCategorizedChats({ yourTurn: [], theirTurn: [] });
      return;
    }

    console.log(`🔄 Categorizing ${matches.length} matches`);

    const yourTurn: ChatItem[] = [];
    const theirTurn: ChatItem[] = [];

    try {
      await Promise.all(
        matches.map(async (item: Match) => {
          try {
            console.log(`📨 Fetching messages for match: ${item.userId}`);

            let messages: Message[] = [];

            // Try multiple endpoints
            try {
              const response = await axios.get<Message[]>(
                `${BASE_URL}/messages`,
                {
                  params: { senderId: userId, receiverId: item.userId },
                },
              );
              messages = response.data || [];
            } catch (error) {
              console.log('❌ Main endpoint failed, trying fallback...');
              try {
                const fallbackResponse = await axios.get<Message[]>(
                  `${BASE_URL}/messages/${item.userId}`,
                  { params: { senderId: userId } },
                );
                messages = fallbackResponse.data || [];
              } catch (fallbackError) {
                console.log('❌ Both endpoints failed for user:', item.userId);
                messages = [];
              }
            }

            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : null;

            const chatItem: ChatItem = {
              ...item,
              lastMessage,
            };

            // Improved categorization logic
            if (lastMessage) {
              if (lastMessage.senderId === userId) {
                // I sent the last message - waiting for their reply (Their Turn)
                theirTurn.push(chatItem);
              } else {
                // They sent the last message - my turn to reply (Your Turn)
                yourTurn.push(chatItem);
              }
            } else {
              // No messages yet - put in "Your Turn" to start conversation
              yourTurn.push(chatItem);
            }

            console.log(`💬 Match ${item.firstName}:`, {
              lastMessage: lastMessage?.message,
              sender: lastMessage?.senderId === userId ? 'me' : 'them',
              category:
                lastMessage?.senderId === userId ? 'theirTurn' : 'yourTurn',
            });
          } catch (error) {
            console.log(
              'Error fetching messages for user:',
              item.userId,
              error,
            );
            // If error, put in "Your Turn" by default
            yourTurn.push({ ...item, lastMessage: null });
          }
        }),
      );

      console.log(
        `✅ Categorized: ${yourTurn.length} your turn, ${theirTurn.length} their turn`,
      );

      // Sort by timestamp (most recent first)
      const sortByTimestamp = (a: ChatItem, b: ChatItem) => {
        const timeA = a.lastMessage?.timestamp
          ? new Date(a.lastMessage.timestamp).getTime()
          : 0;
        const timeB = b.lastMessage?.timestamp
          ? new Date(b.lastMessage.timestamp).getTime()
          : 0;
        return timeB - timeA;
      };

      setCategorizedChats({
        yourTurn: yourTurn.sort(sortByTimestamp),
        theirTurn: theirTurn.sort(sortByTimestamp),
      });
    } catch (error) {
      console.log('Error categorizing chats:', error);
    }
  };
  // Listen for new messages via socket to update in real-time
  useEffect(() => {
    if (!socket || !userId) return;

    console.log('🔌 Setting up socket listener for ChatScreen');

    const handleNewMessage = (newMessage: Message) => {
      console.log('📨 New message received in ChatScreen:', newMessage);

      // Check if this message is relevant to our matches
      const isRelevant = matches.some(
        match =>
          match.userId === newMessage.senderId ||
          match.userId === newMessage.receiverId,
      );

      if (isRelevant) {
        console.log('🔄 Refreshing chats due to new message');
        // Refresh the chats to get updated last messages
        setTimeout(() => {
          if (matches.length > 0) {
            fetchAndCategorizeChats();
          }
        }, 500);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [socket, userId, matches]);

  // Refresh when screen comes into focus
  useEffect(() => {
    if (isFocused && userId) {
      console.log('🎯 ChatScreen focused, refreshing data...');
      fetchMatches();
    }
  }, [isFocused, userId]);

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

  const totalMatches =
    categorizedChats.yourTurn.length + categorizedChats.theirTurn.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{totalMatches}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined} // You can add pull-to-refresh here if needed
      >
        {totalMatches > 0 ? (
          <View style={styles.matchesContainer}>
            {/* Your Turn Section - You need to reply */}
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
                    key={item.userId || `your-turn-${index}`}
                    item={item}
                    userId={userId!}
                  />
                ))}
              </View>
            )}

            {/* Their Turn Section - Waiting for their reply */}
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
                    key={item.userId || `their-turn-${index}`}
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
