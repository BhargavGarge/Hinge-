import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  Pressable,
  TextInput,
  Button,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/ionicons';
import EvilIcons from '@react-native-vector-icons/evil-icons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Prompts: undefined;
  Photos: undefined;
};
const PhotoScreen = () => {
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '', '']);
  const [imageUrl, setImageUrl] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Photos'>>();
  const handleAddImage = () => {
    const index = imageUrls?.findIndex(url => url === '');
    if (index !== -1) {
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = imageUrl;
      setImageUrls(updatedUrls);
      setImageUrl('');
    }
  };

  const handleNext = () => {
    navigation.navigate('Prompts');
  };
  console.log('images', imageUrls);
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
            <Ionicons name="camera-outline" size={23} color="black" />
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
            fontFamily: 'GeezaPro-Bold',
            marginTop: 15,
          }}
        >
          Pick your photos and videos
        </Text>

        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            {imageUrls?.slice(0, 3).map((url, index) => (
              <Pressable
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                }}
                key={index}
              >
                {url ? (
                  <Image
                    source={{ uri: url }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      resizeMode: 'cover',
                    }}
                  />
                ) : (
                  <EvilIcons name="image" size={22} color="black" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            {imageUrls?.slice(3, 6).map((url, index) => (
              <Pressable
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                }}
                key={index}
              >
                {url ? (
                  <Image
                    source={{ uri: url }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      resizeMode: 'cover',
                    }}
                  />
                ) : (
                  <EvilIcons name="image" size={22} color="black" />
                )}
              </Pressable>
            ))}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: 'gray', fontSize: 15 }}>Drag to reorder</Text>

            <Text
              style={{
                marginTop: 4,
                color: '#581845',
                fontWeight: '500',
                fontSize: 15,
              }}
            >
              Add four to six photos
            </Text>
          </View>

          <View style={{ marginTop: 25 }}>
            <Text>Add a picture of yourself</Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderRadius: 5,
                marginTop: 10,
                backgroundColor: '#DCDCDC',
                paddingVertical: 6,
              }}
            >
              <EvilIcons
                name="image"
                style={{ marginLeft: 8 }}
                size={22}
                color="black"
              />
              <TextInput
                value={imageUrl}
                onChangeText={text => setImageUrl(text)}
                style={{ color: 'gray', marginVertical: 10, width: 300 }}
                placeholder="Enter your image url"
              />
            </View>
            <Button onPress={handleAddImage} title="Add Image" />
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

export default PhotoScreen;

const styles = StyleSheet.create({});
