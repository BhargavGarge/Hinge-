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
  Name: undefined;
};

const { width, height } = Dimensions.get('window');

const BasicInfo = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        {/* Decorative Background Elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />

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
          <Text style={styles.mainTitle}>You're one of a kind.</Text>
          <Text style={styles.subtitle}>Your profile should be too.</Text>

          <View style={styles.decorativeLine}>
            <View style={styles.decorativeLineDot} />
          </View>
        </Animated.View>

        {/* Animation Section */}
        <Animated.View
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.animationWrapper}>
            <View style={styles.animationInnerGlow} />
            <LottieView
              style={styles.lottie}
              source={require('../../assets/love.json')}
              autoPlay
              loop={true}
              speed={0.7}
            />
          </View>
        </Animated.View>

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
            onPress={() => navigation.navigate('Name')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </Pressable>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text> &{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    backgroundColor: '#FFFFFF',
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#FFE4EC',
    opacity: 0.4,
    top: -120,
    right: -120,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FFD6E7',
    opacity: 0.3,
    bottom: 150,
    left: -80,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFCCE0',
    opacity: 0.25,
    top: '45%',
    right: -60,
  },
  headerContainer: {
    marginTop: 60,
    marginHorizontal: 30,
    zIndex: 10,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
    color: '#1A1A1A',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 38,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
    color: '#C2185B',
    marginTop: 8,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  decorativeLine: {
    width: 70,
    height: 5,
    backgroundColor: '#C2185B',
    borderRadius: 3,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorativeLineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#880E4F',
    position: 'absolute',
    right: -10,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    zIndex: 5,
  },
  animationWrapper: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 150,
    shadowColor: '#C2185B',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#FFE4EC',
  },
  animationInnerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFF0F5',
    opacity: 0.5,
  },
  lottie: {
    height: 260,
    width: 260,
    zIndex: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 45,
    paddingHorizontal: 20,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#C2185B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFE4EC',
  },
  emojiCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  featureEmoji: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  ctaContainer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 45 : 35,
    zIndex: 10,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#C2185B',
    shadowColor: '#880E4F',
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
    backgroundColor: '#C2185B',
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
    borderColor: '#C2185B',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    textAlign: 'center',
    color: '#C2185B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  termsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
    marginBottom: 20,
  },
  termsLink: {
    color: '#C2185B',
    fontWeight: '600',
  },
});
