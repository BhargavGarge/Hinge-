import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveRegistrationProgress } from '../utils/registrationUtlis';

type RootStackParamList = {
  Gender: undefined;
  Location: undefined;
};

const LocationScreen = () => {
  const [location, setLocation] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Location'>>();

  const handleNext = () => {
    if (!location.trim()) {
      Alert.alert('Please enter your location');
      return;
    }

    saveRegistrationProgress('Location', { location });
    navigation.navigate('Gender');
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <View style={{ marginTop: 60, marginHorizontal: 20, flex: 1 }}>
        {/* Header */}
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
            <MaterialCommunityIcons name="map-marker" size={23} color="black" />
          </View>

          <Image
            style={{ width: 100, height: 40, marginLeft: 10 }}
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
          Where do you live?
        </Text>

        {/* Manual Input Box */}
        <TextInput
          style={styles.input}
          placeholder="Enter your city or address"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />

        <Text
          style={{
            marginTop: 10,
            color: 'gray',
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          Example: Berlin, Germany
        </Text>

        {/* Next Button */}
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
            <Ionicons
              name="chevron-forward-circle-outline"
              size={55}
              color="#581845"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  input: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
});
