import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';
import Video from 'react-native-video';
import { BASE_URL } from '../url/url';

const { height } = Dimensions.get('window');
// change this to your backend

const LoginScreen = () => {
  const [option, setOption] = useState('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = { email, password };
      const response = await axios.post(`${BASE_URL}/login`, user);

      const { token, IdToken, AccessToken } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('idToken', IdToken);
      await AsyncStorage.setItem('accessToken', AccessToken);

      setToken(token);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Login failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const goToCreateAccount = () => {
    setOption('Create account');
    navigation.navigate('Basic'); // your registration screen
  };

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <Video
        source={require('../../assets/video.mp4')}
        style={styles.videoBackground}
        resizeMode="cover"
        repeat
        muted
        rate={0.8}
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.logo}>Spark</Text>
              <Text style={styles.tagline}>{option}</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  loading && styles.authButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.authButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Don't have an account?</Text>
                <TouchableOpacity onPress={goToCreateAccount}>
                  <Text style={styles.toggleButton}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(88,24,69,0.7)',
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 56, fontWeight: '700', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '400' },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  authButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  authButtonDisabled: { opacity: 0.7 },
  authButtonText: { color: '#581845', fontSize: 18, fontWeight: '700' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  toggleButton: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
  terms: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 40,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default LoginScreen;
