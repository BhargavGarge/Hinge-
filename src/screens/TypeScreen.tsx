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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getRegistrationProgress,
  saveRegistrationProgress,
} from '../utils/registrationUtlis';

type RootStackParamList = {
  Type: undefined;
  Dating: undefined;
};

const TypeScreen = () => {
  const [type, setType] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Type'>>();

  useEffect(() => {
    getRegistrationProgress('Type').then(progressData => {
      if (progressData) {
        setType(progressData.type || '');
      }
    });
  }, []);

  const handleNext = () => {
    if (type.trim() !== '') {
      saveRegistrationProgress('Type', { type });
    }
    navigation.navigate('Dating');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={23} color="black" />
          </View>
          <Image
            style={styles.logo}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>What's your sexuality?</Text>

        {/* Description */}
        <Text style={styles.description}>
          Hinge users are matched based on these gender groups. You can add more
          about gender after registering
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {[
            { label: 'Straight', value: 'Straight' },
            { label: 'Gay', value: 'Gay' },
            { label: 'Lesbian', value: 'Lesbian' },
            { label: 'Bisexual', value: 'Bisexual' },
          ].map(option => (
            <View key={option.value} style={styles.optionRow}>
              <Text style={styles.optionText}>{option.label}</Text>
              <Pressable onPress={() => setType(option.value)}>
                <FontAwesome
                  name="circle"
                  size={26}
                  color={type === option.value ? '#581845' : '#F0F0F0'}
                />
              </Pressable>
            </View>
          ))}

          {/* Visibility Note */}
          <View style={styles.visibilityContainer}>
            <Ionicons name="eye-outline" size={25} color="#900C3F" />
            <Text style={styles.visibilityText}>Visible on profile</Text>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextButton}
          disabled={!type}
        >
          <Ionicons
            name="chevron-forward-circle-outline"
            size={45}
            color={type ? '#581845' : '#CCCCCC'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    marginTop: 80,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'black',
  },
  description: {
    fontSize: 15,
    marginTop: 20,
    color: 'gray',
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 30,
    flexDirection: 'column',
    gap: 15,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  visibilityContainer: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityText: {
    fontSize: 15,
    color: 'black',
  },
  nextButton: {
    marginTop: 30,
    marginLeft: 'auto',
  },
});

export default TypeScreen;
