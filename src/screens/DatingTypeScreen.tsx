import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../utils/registrationUtlis';

type RootStackParamList = {
  Dating: undefined;
  LookingFor: undefined;
};
const DatingType = () => {
  const [datingPreferences, setDatingPreferences] = useState<string[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Dating'>>();
  interface DatingPreferenceOption {
    option: string;
  }

  const chooseOption = option => {
    if (datingPreferences.includes(option)) {
      setDatingPreferences(
        datingPreferences.filter(selectedOption => selectedOption !== option),
      );
    } else {
      setDatingPreferences([...datingPreferences, option]);
    }
  };
  useEffect(() => {
    getRegistrationProgress('Dating').then(progressData => {
      if (progressData) {
        setDatingPreferences(progressData.datingPreferences || []);
      }
    });
  }, []);
  const handleNext = () => {
    if (datingPreferences.length > 0) {
      saveRegistrationProgress('Dating', { datingPreferences });
    }
    navigation.navigate('LookingFor');
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
            <Ionicons name="heart-outline" size={23} color="black" />
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
            fontSize: 20,
          }}
        >
          Who do you want to Date?
        </Text>

        <Text
          style={{
            fontSize: 15,
            marginTop: 20,
            color: 'gray',
            textAlign: 'center',
          }}
        >
          Select all people you're open to meeting
        </Text>

        <View style={{ marginTop: 30, flexDirection: 'column', gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8, // Added padding for better touch area
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '500',
                color: 'black', // EXPLICITLY SET BLACK COLOR
              }}
            >
              Men
            </Text>
            <Pressable onPress={() => chooseOption('Men')}>
              <FontAwesome5
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Men') ? '#581845' : '#F0F0F0'
                }
              />
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8, // Added padding for better touch area
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '500',
                color: 'black', // EXPLICITLY SET BLACK COLOR
              }}
            >
              Women
            </Text>
            <Pressable onPress={() => chooseOption('Women')}>
              <FontAwesome5
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Women') ? '#581845' : '#F0F0F0'
                }
              />
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8, // Added padding for better touch area
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '500',
                color: 'black', // EXPLICITLY SET BLACK COLOR
              }}
            >
              Everyone
            </Text>
            <Pressable onPress={() => chooseOption('Everyone')}>
              <FontAwesome5
                name="circle"
                size={26}
                color={
                  datingPreferences.includes('Everyone') ? '#581845' : '#F0F0F0'
                }
              />
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 30,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="checkbox-outline" size={25} color="#900C3F" />

            <Text
              style={{
                color: 'black',
                fontWeight: '600',
                fontSize: 15, // Increased from 10 to 15 for better readability
              }}
            >
              Visible on Profile?
            </Text>
          </View>
        </View>

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

export default DatingType;

const styles = StyleSheet.create({});
