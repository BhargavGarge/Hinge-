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
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from '@react-native-vector-icons/evil-icons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { launchImageLibrary } from 'react-native-image-picker';
type RootStackParamList = {
  Photos: undefined;
  Prompts: undefined;
  // add other routes here if needed
};

const PhotoScreen = () => {
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '', '']);
  const [imageUrl, setImageUrl] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Function to pick image from gallery
  const pickImageFromGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 'high' as const,
      maxWidth: 500,
      maxHeight: 500,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          handleAddImageWithUri(uri);
        }
      }
    });
  };

  // Function to add image from gallery
  const handleAddImageWithUri = (uri: string) => {
    const index = imageUrls.findIndex(url => url === '');
    if (index !== -1) {
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = uri;
      setImageUrls(updatedUrls);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 6 photos');
    }
  };

  // Function to add image from URL input
  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    const index = imageUrls.findIndex(url => url === '');
    if (index !== -1) {
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = imageUrl.trim();
      setImageUrls(updatedUrls);
      setImageUrl('');
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 6 photos');
    }
  };

  // Function to remove image
  const handleRemoveImage = (index: number) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = '';
    setImageUrls(updatedUrls);
  };

  const handleNext = () => {
    if (imageUrls.filter(url => url !== '').length < 4) {
      Alert.alert(
        'More Photos Needed',
        'Please add at least 4 photos to continue',
      );
      return;
    }

    navigation.navigate('Prompts');
  };

  const filledImageCount = imageUrls.filter(url => url !== '').length;

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
            marginTop: 15,
            color: 'black',
          }}
        >
          Pick your photos and videos
        </Text>

        {/* Photo Grid - First Row */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            {imageUrls?.slice(0, 3).map((url, index) => (
              <Pressable
                onPress={() =>
                  url ? handleRemoveImage(index) : pickImageFromGallery()
                }
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                  backgroundColor: url ? 'transparent' : '#F5F5F5',
                }}
                key={index}
              >
                {url ? (
                  <View
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      source={{ uri: url }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                        resizeMode: 'cover',
                      }}
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 10,
                        padding: 2,
                      }}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <EvilIcons name="image" size={35} color="#581845" />
                    <Text
                      style={{ color: '#581845', fontSize: 12, marginTop: 5 }}
                    >
                      Add Photo
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Photo Grid - Second Row */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            {imageUrls?.slice(3, 6).map((url, index) => (
              <Pressable
                onPress={() =>
                  url ? handleRemoveImage(index + 3) : pickImageFromGallery()
                }
                style={{
                  borderColor: '#581845',
                  borderWidth: url ? 0 : 2,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  height: 100,
                  backgroundColor: url ? 'transparent' : '#F5F5F5',
                }}
                key={index + 3}
              >
                {url ? (
                  <View
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      source={{ uri: url }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                        resizeMode: 'cover',
                      }}
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: 10,
                        padding: 2,
                      }}
                      onPress={() => handleRemoveImage(index + 3)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <EvilIcons name="image" size={35} color="#581845" />
                    <Text
                      style={{ color: '#581845', fontSize: 12, marginTop: 5 }}
                    >
                      Add Photo
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: 'gray', fontSize: 15 }}>
              Tap to add or remove photos
            </Text>

            <Text
              style={{
                marginTop: 4,
                color: '#581845',
                fontWeight: '500',
                fontSize: 15,
              }}
            >
              Add four to six photos ({filledImageCount}/6)
            </Text>
          </View>

          {/* Alternative: Add from URL */}
          <View style={{ marginTop: 25 }}>
            <Text style={{ color: 'black', fontSize: 16, fontWeight: '500' }}>
              Or add image via URL
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderRadius: 5,
                marginTop: 10,
                backgroundColor: '#F5F5F5',
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
            >
              <EvilIcons
                name="image"
                style={{ marginLeft: 8 }}
                size={22}
                color="#581845"
              />
              <TextInput
                value={imageUrl}
                onChangeText={text => setImageUrl(text)}
                style={{
                  color: 'black',
                  marginVertical: 10,
                  width: 250,
                  fontSize: 16,
                }}
                placeholder="Enter image URL"
                placeholderTextColor="#808080"
              />
            </View>
            <Button
              onPress={handleAddImage}
              title="Add Image URL"
              color="#581845"
              disabled={!imageUrl.trim()}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{
            marginTop: 30,
            marginLeft: 'auto',
            opacity: filledImageCount >= 4 ? 1 : 0.5,
          }}
          disabled={filledImageCount < 4}
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
