import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const [option, setOption] = useState('Sign In');
  const navigation = useNavigation();
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');
  const { token, setToken } = useContext(AuthContext);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    ]).start();
  }, []);

  const createAccount = () => {
    setOption('Create account');
    navigation.navigate('Basic');
  };

  const handleLogin = async () => {
    setOption('Sign In');

    if (!word || !password) {
      return;
    }

    console.log('Hi');

    const user = {
      email: word,
      password: password,
    };

    const response = await axios.post(`${BASE_URL}/login`, user);

    const { token, IdToken, AccessToken } = response.data;

    console.log('token', token);

    await AsyncStorage.setItem('token', token);
    setToken(token);
    await AsyncStorage.setItem('idToken', IdToken);
    await AsyncStorage.setItem('accessToken', AccessToken);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image
                style={styles.logo}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/4207/4207268.png',
                }}
              />
            </View>
            <Text style={styles.appName}>Hinge</Text>
            <Text style={styles.tagline}>Designed to be deleted</Text>
          </Animated.View>
        </View>

        {/* Content Section */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {option === 'Sign In' ? (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    emailFocused && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    value={word}
                    onChangeText={text => setWord(text)}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordFocused && styles.inputContainerFocused,
                  ]}
                >
                  <TextInput
                    secureTextEntry={true}
                    value={password}
                    onChangeText={text => setPassword(text)}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
              </View>

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <Text style={styles.optionText}>Keep me logged in</Text>
                <Pressable>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../assets/login.json')}
                style={styles.lottie}
                autoPlay
                loop={true}
                speed={0.7}
              />
              <Text style={styles.createAccountText}>
                Join thousands finding meaningful connections
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleLogin}
              style={[
                styles.button,
                styles.primaryButton,
                option !== 'Sign In' && styles.buttonOutline,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  option !== 'Sign In' && styles.buttonTextOutline,
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={createAccount}
              style={[
                styles.button,
                styles.secondaryButton,
                option === 'Create account' && styles.primaryButton,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.buttonTextSecondary,
                  option === 'Create account' && styles.buttonTextPrimary,
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#581845',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#581845',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  formContainer: {
    marginTop: 20,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    paddingHorizontal: 20,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#581845',
    shadowColor: '#581845',
    shadowOpacity: 0.15,
  },
  input: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#581845',
    fontWeight: '600',
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  lottie: {
    height: 200,
    width: 300,
  },
  createAccountText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#581845',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  buttonOutline: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowOpacity: 0.05,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonTextPrimary: {
    color: '#FFF',
  },
  buttonTextSecondary: {
    color: '#581845',
  },
  buttonTextOutline: {
    color: '#581845',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#581845',
    fontWeight: '600',
  },
});
