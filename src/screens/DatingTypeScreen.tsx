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
  const [selectedOption, setSelectedOption] = useState<string>(''); // Single selection
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Dating'>>();

  // Single selection handler
  const chooseOption = (option: string) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    getRegistrationProgress('Dating').then(progressData => {
      if (progressData && progressData.datingPreferences) {
        // For backward compatibility, take the first option if array exists
        if (
          Array.isArray(progressData.datingPreferences) &&
          progressData.datingPreferences.length > 0
        ) {
          setSelectedOption(progressData.datingPreferences[0]);
        } else if (typeof progressData.datingPreferences === 'string') {
          setSelectedOption(progressData.datingPreferences);
        }
      }
    });
  }, []);

  const handleNext = () => {
    if (selectedOption.trim() !== '') {
      // Save as array with single item for compatibility
      saveRegistrationProgress('Dating', {
        datingPreferences: [selectedOption],
      });
    }
    navigation.navigate('LookingFor');
  };

  const options = [
    { label: 'Men', value: 'Men' },
    { label: 'Women', value: 'Women' },
    { label: 'Everyone', value: 'Everyone' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart-outline" size={23} color="black" />
          </View>
          <Image
            style={styles.logo}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png',
            }}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Who do you want to Date?</Text>

        {/* Description */}
        <Text style={styles.description}>
          Select one option that best describes who you're open to meeting
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map(option => (
            <View key={option.value} style={styles.optionRow}>
              <Text style={styles.optionText}>{option.label}</Text>
              <Pressable onPress={() => chooseOption(option.value)}>
                <View style={styles.radioContainer}>
                  {/* Outer circle */}
                  <FontAwesome5
                    name="circle"
                    size={26}
                    color={
                      selectedOption === option.value ? '#581845' : '#F0F0F0'
                    }
                  />
                  {/* Inner filled circle when selected */}
                  {selectedOption === option.value && (
                    <View style={styles.radioInner}>
                      <FontAwesome5
                        name="circle"
                        size={14}
                        color="#581845"
                        style={styles.radioFill}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          ))}

          {/* Visibility Note */}
          <View style={styles.visibilityContainer}>
            <Ionicons name="eye-outline" size={25} color="#900C3F" />
            <Text style={styles.visibilityText}>Visible on Profile</Text>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[
            styles.nextButton,
            !selectedOption && styles.nextButtonDisabled,
          ]}
          disabled={!selectedOption}
        >
          <Ionicons
            name="chevron-forward-circle-outline"
            size={45}
            color={selectedOption ? '#581845' : '#CCCCCC'}
          />
        </TouchableOpacity>

        {/* Debug View - Remove in production */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Selected: {selectedOption || 'None'}
          </Text>
        </View>
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
    marginTop: 30,
    textAlign: 'center',
    color: 'black',
    fontWeight: '600',
    fontSize: 20,
  },
  description: {
    fontSize: 15,
    marginTop: 20,
    color: 'gray',
    textAlign: 'center',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'black',
  },
  radioContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  radioFill: {
    // This creates the filled circle effect
  },
  visibilityContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 15,
  },
  nextButton: {
    marginTop: 30,
    marginLeft: 'auto',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#666',
    fontSize: 14,
  },
});

export default DatingType;
