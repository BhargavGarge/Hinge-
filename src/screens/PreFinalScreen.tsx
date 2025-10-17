import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  BasicInfo: undefined;
  Home: undefined;
};

const { width, height } = Dimensions.get('window');

const PreFinalScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const badgesAnim = useRef(new Animated.Value(0)).current;
  const confettiScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(confettiScale, {
          toValue: 1,
          tension: 8,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 15,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(badgesAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        {/* Decorative Background Elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />

        {/* Confetti Animation */}
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: confettiScale }],
            },
          ]}
        >
          <LottieView
            style={styles.confetti}
            source={require('../../assets/confetti.json')} // Use a celebration/confetti animation
            autoPlay
            loop={false}
            speed={1}
          />
        </Animated.View>

        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.checkmarkContainer}>
            <Animated.View
              style={[
                styles.checkmarkCircle,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          </View>

          <Text style={styles.mainTitle}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Your profile is ready to make great first impressions
          </Text>
        </Animated.View>

        {/* Feature Badges */}
        <Animated.View
          style={[
            styles.badgesContainer,
            {
              opacity: badgesAnim,
              transform: [
                {
                  translateY: badgesAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>📸</Text>
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeTitle}>Photos Added</Text>
              <Text style={styles.badgeSubtext}>Looking great!</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>✏️</Text>
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeTitle}>Prompts Complete</Text>
              <Text style={styles.badgeSubtext}>Show who you are</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>💫</Text>
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeTitle}>Profile Ready</Text>
              <Text style={styles.badgeSubtext}>Time to connect</Text>
            </View>
          </View>
        </Animated.View>

        {/* Success Animation */}
        <Animated.View
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        ></Animated.View>

        {/* CTA Section */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => navigation.navigate('Home')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Start Connecting</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Review Profile</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    backgroundColor: '#FFFFFF',
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: '#FFF9FA',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#E8F5E9',
    opacity: 0.4,
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#e4c8e6',
    opacity: 0.3,
    bottom: 120,
    left: -70,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#d6a5d3',
    opacity: 0.25,
    top: '40%',
    right: -50,
  },
  confettiContainer: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    marginTop: 10,
    marginHorizontal: 30,
    alignItems: 'center',
    zIndex: 10,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#af4c9d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7d2e6c',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  checkmark: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
    color: '#1A1A1A',
    lineHeight: 44,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  badgesContainer: {
    marginTop: 40,
    paddingHorizontal: 30,
    gap: 16,
    zIndex: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  badgeSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    zIndex: 5,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },
  animationInnerGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F1F8F4',
    opacity: 0.6,
  },
  lottie: {
    height: 180,
    width: 180,
    zIndex: 2,
  },
  ctaContainer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 45 : 35,
    zIndex: 10,
    marginBottom: 50,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#4CAF50',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    backgroundColor: '#af4ca5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#af4caf',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    textAlign: 'center',
    color: '#af4cac',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
