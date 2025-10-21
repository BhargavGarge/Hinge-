import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveRegistrationProgress } from '../utils/registrationUtlis';
import axios from 'axios';
import { BASE_URL } from '../url/url';

type RootStackParamList = {
  Password: undefined;
  Otp: { email: string }; // ✅ FIX: Add email parameter type
};

const PasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // ✅ ADD: Loading state
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Password'>>();
  const email = (route.params as { email?: string })?.email; // ✅ FIX: Proper type casting

  console.log('🔍 Password Screen - Email:', email);
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found.');
      return;
    }

    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Sending OTP request to:', `${BASE_URL}/sendOtp`);
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);

      const response = await axios.post(
        `${BASE_URL}/sendOtp`,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          timeout: 15000, // 15 second timeout
        },
      );

      console.log('✅ OTP Sent Successfully:', response.data);

      // Navigate only after successful API call
      navigation.navigate('Otp', { email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.error('❌ OTP Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        baseUrl: BASE_URL,
      });

      let errorMessage = 'Failed to send OTP';

      // Network errors
      if (
        error.code === 'NETWORK_ERROR' ||
        error.message.includes('Network Error')
      ) {
        errorMessage = `Cannot connect to server.\n\nCurrent BASE_URL: ${BASE_URL}\n\nPlease check:\n• Server is running on port 9000\n• Correct BASE_URL for your environment\n• Computer and phone on same network`;
      }
      // Timeout errors
      else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Server might be down or slow.';
      }
      // Server errors
      else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      // Other errors
      else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('OTP Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleNext = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }

    // Save progress if needed
    if (password.trim() !== '') {
      saveRegistrationProgress('Password', { password });
    }

    // ✅ Call API directly
    handleSendOtp();
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <View style={{ marginTop: 80, marginHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="lock-closed-outline" size={26} color="black" />
          </View>
          <Image
            style={{ width: 100, height: 40 }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>

        <Text
          style={{
            marginTop: 30,
            textAlign: 'center',
            color: 'black',
            fontWeight: '600',
            fontSize: 22,
          }}
        >
          Choose Password
        </Text>

        <TextInput
          value={password}
          onChangeText={text => setPassword(text)}
          autoFocus={true}
          placeholder="Enter your Password"
          secureTextEntry={true}
          placeholderTextColor={'#BEBEBE'}
          style={{
            width: 340,
            marginVertical: 10,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            color: 'black',
            fontSize: password ? 22 : 22,
          }}
        />

        <Text style={{ color: 'gray', marginTop: 7, fontSize: 15 }}>
          Note: Your details will be safe with us
        </Text>

        <Text style={{ color: 'gray', marginTop: 5, fontSize: 12 }}>
          Password must be at least 8 characters with uppercase, lowercase,
          number, and special character
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={loading}
          style={{
            marginTop: 30,
            marginLeft: 'auto',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#581845" />
          ) : (
            <Ionicons
              name="chevron-forward-circle-outline"
              size={45}
              color="#581845"
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PasswordScreen;

const styles = StyleSheet.create({});
