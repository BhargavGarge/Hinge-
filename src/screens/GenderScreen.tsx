import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Gender: undefined;
  Dating: undefined;
};

const GenderScreen = () => {
  const [gender, setGender] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Gender'>>();

  const handleNext = () => {
    navigation.navigate('Dating');
  };

  const options = ['Men', 'Women', 'Non Binary'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>Hello</Text>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="male-outline" size={23} color="black" />
          </View>
          <Image
            style={styles.logo}
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
          Which Gender describe you the best?
        </Text>

        <Text style={styles.subtitle}>
          Hinge users are matched based on these gender groups. You can add more
          about gender after registering
        </Text>

        <View style={styles.optionsContainer}>
          {options.map(option => (
            <View key={option} style={styles.optionRow}>
              <Text style={styles.optionText}>{option}</Text>
              <Pressable onPress={() => setGender(option)}>
                <FontAwesome5
                  name="circle"
                  solid={gender === option}
                  size={26}
                  color={gender === option ? '#581845' : '#F0F0F0'}
                />
              </Pressable>
            </View>
          ))}

          <View style={styles.visibleRow}>
            <Ionicons name="checkbox-outline" size={25} color="#900C3F" />

            <Text
              style={{
                textAlign: 'center',
                color: 'black',
                fontWeight: '600',
                fontSize: 10,
              }}
            >
              Visible on Profile?
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextBtn}
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

export default GenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  content: {
    marginTop: 80,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
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
    fontFamily: 'GeezaPro-Bold',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 20,
    color: 'gray',
  },
  optionsContainer: {
    marginTop: 30,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    color: 'black',
  },
  visibleRow: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibleText: {
    fontSize: 15,
    marginLeft: 8,
  },
  nextBtn: {
    marginTop: 30,
    marginLeft: 'auto',
  },
});
