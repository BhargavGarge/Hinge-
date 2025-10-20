import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Birth: undefined;
  Otp: undefined;
};

const OtpScreen = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Otp'>>();

  const handleConfirmSignUp = () => {
    const otpCode = otp.join('');
    console.log('Entered OTP:', otpCode);

    if (otpCode.length === 6) {
      console.log('✅ Navigating to Birth screen');
      navigation.navigate('Birth');
    } else {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits');
    }
  };

  // Auto-navigate when all 6 digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleConfirmSignUp();
    }
  }, [otp]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code to continue (test mode)
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            ref={el => (inputs.current[index] = el)}
            style={styles.otpInput}
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
          />
        ))}
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Continue (Manual Test)" onPress={handleConfirmSignUp} />
      </View>

      <View style={{ marginTop: 15 }}>
        <Button
          title="Reset Fields"
          onPress={() => setOtp(['', '', '', '', '', ''])}
        />
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 30,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
});
