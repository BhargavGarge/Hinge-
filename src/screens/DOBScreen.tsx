import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  DOBScreen: undefined;
  Location: undefined;
};

const DOBScreen = () => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'DOBScreen'>>();
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const handleDayChange = (text: string) => {
    setDay(text);
    if (text.length === 2 && monthRef.current) {
      monthRef.current.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    setMonth(text);
    if (text.length === 2 && yearRef.current) {
      yearRef.current.focus();
    }
  };

  const handleYearChange = (text: string) => {
    setYear(text);
  };

  const handleNext = () => {
    navigation.navigate('Location');
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
            <Ionicons name="calendar-outline" size={23} color="black" />
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
          What's your DOB?
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 80,
            justifyContent: 'center',
          }}
        >
          <TextInput
            value={day}
            onChangeText={handleDayChange}
            autoFocus
            placeholder="DD"
            placeholderTextColor={'#BEBEBE'}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 60,
              color: 'black',
              fontSize: 22,
            }}
            maxLength={2}
            keyboardType="numeric"
          />
          <TextInput
            value={month}
            onChangeText={handleMonthChange}
            ref={monthRef}
            placeholder="MM"
            placeholderTextColor={'#BEBEBE'}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 60,
              color: 'black',
              fontSize: 22,
            }}
            maxLength={2}
            keyboardType="numeric"
          />
          <TextInput
            value={year}
            onChangeText={handleYearChange}
            ref={yearRef}
            placeholder="YYYY"
            placeholderTextColor={'#BEBEBE'}
            style={{
              borderBottomWidth: 1,
              borderColor: 'black',
              padding: 10,
              width: 80,
              color: 'black',
              fontSize: 22,
            }}
            maxLength={4}
            keyboardType="numeric"
          />
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

export default DOBScreen;

const styles = StyleSheet.create({});
