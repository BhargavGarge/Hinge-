import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../utils/registrationUtlis';
type RootStackParamList = {
  Email: undefined;
  Password: { email: string };
};

const EmailScreen = () => {
  const [email, setEmail] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Email'>>();
  useEffect(() => {
    getRegistrationProgress('Email').then(progressData => {
      if (progressData) {
        setEmail(progressData.email || '');
      }
    });
  }, []);
  const handleNext = () => {
    if (email.trim() !== '') {
      saveRegistrationProgress('Email', { email });
    }
    navigation.navigate('Password', {
      email: email,
    });
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
            <Ionicons name="mail-outline" size={26} color="black" />
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
          What's your Email?
        </Text>

        <Text style={{ marginTop: 10, fontSize: 15, color: 'gray' }}>
          Email Verification helps us keep the account secure
        </Text>

        <TextInput
          value={email}
          onChangeText={text => setEmail(text)}
          autoFocus
          placeholder="Enter your email"
          placeholderTextColor="#BEBEBE"
          style={{
            width: 340,
            marginVertical: 10,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            color: 'black',
            fontSize: 22,
          }}
        />

        <Text style={{ color: 'gray', marginTop: 7, fontSize: 15 }}>
          Note: You will be asked to verify your email
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{ marginTop: 30, marginLeft: 'auto' }}
        >
          <Ionicons
            name="chevron-forward-circle-outline"
            size={45}
            color="#581845"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({});
