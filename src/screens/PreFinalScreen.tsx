import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState, useContext } from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';
import { BASE_URL } from '../url/url';
import { getRegistrationProgress } from '../utils/registrationUtlis';

type RootStackParamList = {
  BasicInfo: undefined;
  Home: undefined;
};

const { width } = Dimensions.get('window');

const ModernIllustration = ({ animatedValue }) => (
  <Animated.View
    style={[styles.illustrationContainer, { opacity: animatedValue }]}
  >
    <Svg width={width * 0.85} height={280} viewBox="0 0 320 280">
      <Defs>
        <RadialGradient id="glow1" cx="50%" cy="50%">
          <Stop offset="0%" stopColor="#af4c9d" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#af4c9d" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glow2" cx="50%" cy="50%">
          <Stop offset="0%" stopColor="#d6a5d3" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#d6a5d3" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Glowing orbs */}
      <Circle cx="80" cy="70" r="60" fill="url(#glow1)" />
      <Circle cx="240" cy="120" r="80" fill="url(#glow2)" />

      {/* Abstract shapes representing connection */}
      <Path
        d="M60 140 Q160 80 260 140"
        stroke="#af4c9d"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="60" cy="140" r="12" fill="#af4c9d" />
      <Circle cx="160" cy="95" r="8" fill="#d6a5d3" />
      <Circle cx="260" cy="140" r="12" fill="#af4c9d" />

      {/* Floating hearts/connections */}
      <Path
        d="M100 200 L105 195 L110 200 L105 210 Z"
        fill="#e4c8e6"
        opacity="0.6"
      />
      <Path
        d="M220 180 L225 175 L230 180 L225 190 Z"
        fill="#d6a5d3"
        opacity="0.7"
      />
      <Path
        d="M150 230 L155 225 L160 230 L155 240 Z"
        fill="#af4c9d"
        opacity="0.5"
      />

      {/* Sparkles */}
      <Path
        d="M40 60 L42 65 L47 67 L42 69 L40 74 L38 69 L33 67 L38 65 Z"
        fill="#af4c9d"
        opacity="0.8"
      />
      <Path
        d="M280 90 L282 95 L287 97 L282 99 L280 104 L278 99 L273 97 L278 95 Z"
        fill="#d6a5d3"
        opacity="0.7"
      />
      <Path
        d="M160 40 L162 45 L167 47 L162 49 L160 54 L158 49 L153 47 L158 45 Z"
        fill="#e4c8e6"
        opacity="0.6"
      />
    </Svg>
  </Animated.View>
);

const PreFinalScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState<any>(null);
  const { token, setToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const illustrationAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getAllUserData();
  }, []);

  const getAllUserData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Workplace',
        'JobTitle',
        'Photos',
        'Prompts',
      ];

      let userData = {};
      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          userData = { ...userData, ...screenData };
        }
      }

      setUserData(userData);
      startAnimations();
    } catch (error) {
      console.log('Error', error);
    }
  };

  const startAnimations = () => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(illustrationAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const clearAllScreenData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Workplace',
        'JobTitle',
        'Photos',
        'Prompts',
      ];

      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };

  const registerUser = async () => {
    if (!userData) return;

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/register`, userData);

      if (response.data.token) {
        const token = response.data.token;
        await AsyncStorage.setItem('token', token);
        setToken(token);
        setRegistrationComplete(true);
        await clearAllScreenData();

        setTimeout(() => {
          navigation.navigate('Home');
        }, 1500);
      }
    } catch (error) {
      console.log('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConnecting = () => {
    if (registrationComplete) {
      navigation.navigate('Home');
    } else {
      registerUser();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#FFF9FA', '#fef5fd']}
        style={styles.gradient}
      >
        {/* Confetti */}
        {registrationComplete && (
          <Animated.View
            style={[styles.confettiContainer, { opacity: fadeAnim }]}
          >
            <LottieView
              style={styles.confetti}
              source={require('../../assets/confetti.json')}
              autoPlay
              loop={false}
              speed={1}
            />
          </Animated.View>
        )}

        <View style={styles.content}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconWrapper}>
              {loading ? (
                <ActivityIndicator size="large" color="#af4c9d" />
              ) : registrationComplete ? (
                <Text style={styles.icon}>✓</Text>
              ) : (
                <Text style={styles.icon}>✨</Text>
              )}
            </View>

            <Text style={styles.title}>
              {registrationComplete ? "You're all set!" : 'Almost there!'}
            </Text>
            <Text style={styles.subtitle}>
              {registrationComplete
                ? 'Your journey begins now'
                : 'One step away from something special'}
            </Text>
          </Animated.View>

          {/* Illustration */}
          <ModernIllustration animatedValue={illustrationAnim} />

          {/* Description */}
          <Animated.View
            style={[
              styles.descriptionContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <Text style={styles.description}>
              {registrationComplete
                ? 'Ready to meet amazing people who share your interests'
                : 'Complete your profile and start making meaningful connections'}
            </Text>
          </Animated.View>

          {/* CTA Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <Pressable
              onPress={handleStartConnecting}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              disabled={loading}
            >
              <LinearGradient
                colors={['#af4c9d', '#9d3a8d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {registrationComplete
                      ? 'Start Connecting'
                      : 'Complete Registration'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {!registrationComplete && (
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Review Profile</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#af4c9d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fef5fd',
  },
  icon: {
    fontSize: 40,
    color: '#af4c9d',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  descriptionContainer: {
    paddingHorizontal: 12,
    marginBottom: 1,
    position: 'relative',
    bottom: 60,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: '40%',
    position: 'relative',
    bottom: 50,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#af4c9d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#af4c9d',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#af4c9d',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
