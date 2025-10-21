import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { BASE_URL } from '../url/url';

const OtpScreen = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const inputs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation();
  const route = useRoute();
  const email = (route.params as { email?: string })?.email;

  console.log('🔍 OTP Screen - Email:', email);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleConfirmSignUp = useCallback(async () => {
    const otpCode = otp.join('');
    console.log('🔢 Verifying OTP:', otpCode);

    if (!email) {
      Alert.alert('Error', 'Email not found.');
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/confirmSignup`, {
        email: email.trim().toLowerCase(),
        otpCode,
      });

      console.log('✅ Verification success:', response.data);

      Alert.alert('Success!', 'Your email has been verified.', [
        { text: 'Continue', onPress: () => navigation.navigate('Birth') },
      ]);
    } catch (error: any) {
      console.error('❌ Verification error:', error.response?.data);

      if (error.response?.data?.error === 'Invalid verification code') {
        Alert.alert('Invalid Code', 'Please check the code and try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      } else if (error.response?.data?.error === 'Verification code expired') {
        Alert.alert('Code Expired', 'Please request a new verification code.');
        setOtp(['', '', '', '', '', '']);
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || 'Verification failed',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [otp, email, navigation]);

  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found.');
      return;
    }

    try {
      setResendLoading(true);
      setOtp(['', '', '', '', '', '']);

      const response = await axios.post(`${BASE_URL}/resendOtp`, {
        email: email.trim().toLowerCase(),
      });

      console.log('📩 Resend response:', response.data);

      Alert.alert('New Code Sent!', 'Check your email and spam folder.', [
        { text: 'OK' },
      ]);

      // Start 30-second countdown
      setCountdown(30);

      // Focus first input
      inputs.current[0]?.focus();
    } catch (error: any) {
      console.error('❌ Resend error:', error.response?.data);

      let errorMessage = 'Failed to resend code';
      if (error.response?.data?.error === 'Too many attempts') {
        errorMessage = 'Too many attempts. Please wait and try again.';
      } else if (error.response?.data?.error === 'User not found') {
        errorMessage = 'Email not found. Please sign up again.';
      }

      Alert.alert('Resend Failed', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Auto-submit when OTP complete
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleConfirmSignUp();
    }
  }, [otp, handleConfirmSignUp]);

  const handleChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    if (numericText && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to:</Text>
        <Text style={styles.emailText}>{email}</Text>
        <Text style={styles.note}>
          💡 Check your spam folder if you don't see it
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            ref={el => (inputs.current[index] = el)}
            style={[styles.otpInput, value && styles.otpInputFilled]}
            keyboardType="number-pad"
            maxLength={1}
            value={value}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                handleBackspace('', index);
              }
            }}
            autoFocus={index === 0}
            editable={!loading}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || otp.join('').length !== 6) && styles.buttonDisabled,
          ]}
          onPress={handleConfirmSignUp}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              Verify{' '}
              {otp.join('').length === 6 ? `Code: ${otp.join('')}` : 'Code'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resendButton,
            (resendLoading || countdown > 0) && styles.buttonDisabled,
          ]}
          onPress={handleResendOtp}
          disabled={resendLoading || countdown > 0}
        >
          {resendLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.resendText}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Not receiving the code?</Text>
        <Text style={styles.tip}>• Check spam/junk folder</Text>
        <Text style={styles.tip}>• Search for "Amazon Cognito"</Text>
        <Text style={styles.tip}>• Try a different email provider</Text>
        <Text style={styles.tip}>• Wait a few minutes and try again</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  note: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  otpInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  buttonContainer: {
    marginHorizontal: 20,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default OtpScreen;
