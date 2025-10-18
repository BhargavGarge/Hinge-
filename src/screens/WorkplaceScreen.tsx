import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../utils/registrationUtlis';

type RootStackParamList = {
  JobTitle: undefined;
  Workplace: undefined;
};
const WorkPlace = () => {
  const [workPlace, setWorkPlace] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Workplace'>>();

  useEffect(() => {
    getRegistrationProgress('WorkPlace').then(progressData => {
      if (progressData) {
        setWorkPlace(progressData.workPlace);
      }
    });
  }, []);
  const handleNext = () => {
    if (workPlace.trim() !== '') {
      saveRegistrationProgress('WorkPlace', { workPlace });
    }
    navigation.navigate('JobTitle');
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
            <Ionicons name="briefcase-outline" size={23} color="black" />
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
            fontSize: 25,
            fontWeight: 'bold',
            // Removed problematic font family
            marginTop: 15,
            color: 'black', // Added explicit color
          }}
        >
          Where do you work?
        </Text>

        <TextInput
          autoFocus={true}
          value={workPlace}
          onChangeText={text => setWorkPlace(text)}
          placeholder="Workplace" // Fixed placeholder text
          placeholderTextColor="#BEBEBE" // Added placeholder color
          style={{
            width: 340,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            // Removed problematic font family
            fontSize: 22,
            color: 'black', // Added explicit text color
          }}
        />

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

export default WorkPlace;

const styles = StyleSheet.create({});
