import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';

import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Config from 'react-native-config';

type RootStackParamList = {
  Gender: undefined;
  Location: undefined;
};

const LocationScreen = () => {
  const apikey = 'AIzaSyBa95Bo89ux9-6KDvt7f_qKkjBib_t4vuA';
  const [region, setRegion] = useState<
    | {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }
    | undefined
  >(undefined);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Location'>>();

  const [location, setLocation] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  // ✅ Request location permission (Android 12+ support)
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions handled via Info.plist
  };

  // ✅ Get current location on mount
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        setLocation('Permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          const initialRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setRegion(initialRegion);
          fetchAddress(latitude, longitude);
        },
        error => {
          console.log('Error fetching location:', error);
          setLocation('Unable to fetch location');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    })();
  }, []);

  // ✅ Convert coordinates to address using Google Geocoding API
  const fetchAddress = (latitude: number, longitude: number): void => {
    const apiKey = Config.GOOGLE_API_KEY; // Store in .env file (GOOGLE_API_KEY=your_key)
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apikey}`,
    )
      .then((response: Response) => response.json())
      .then(data => {
        if (data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          let formattedAddress = '';
          for (let component of addressComponents) {
            if (component.types.includes('sublocality_level_1')) {
              formattedAddress += component.long_name + ', ';
            }
            if (component.types.includes('locality')) {
              formattedAddress += component.long_name + ', ';
            }
          }
          formattedAddress = formattedAddress.trim().slice(0, -1);
          setLocation(formattedAddress || 'Location found');
        } else {
          setLocation('Address not found');
        }
      })
      .catch(error => {
        console.log('Error fetching address:', error);
        setLocation('Error fetching address');
      })
      .finally(() => setLoading(false));
  };

  const handleNext = () => {
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
            fontSize: 25,
            fontWeight: 'bold',
            fontFamily: 'GeezaPro-Bold',
            marginTop: 15,
          }}
        >
          Where do you live?
        </Text>

        {/* Map Section */}
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#581845" />
            <Text style={{ marginTop: 10, color: 'gray' }}>
              Fetching your location...
            </Text>
          </View>
        ) : region ? (
          <MapView
            style={{
              width: '100%',
              height: 500,
              marginTop: 5,
              borderRadius: 5,
            }}
            region={region}
          >
            <Marker coordinate={region}>
              <View
                style={{
                  backgroundColor: 'black',
                  padding: 12,
                  borderRadius: 30,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: '500',
                    color: 'white',
                  }}
                >
                  {location}
                </Text>
              </View>
            </Marker>
          </MapView>
        ) : (
          <Text style={{ marginTop: 20, color: 'gray' }}>
            Unable to load map
          </Text>
        )}

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{ marginBottom: 40, marginLeft: 'auto' }}
        >
          <Ionicons
            name="chevron-forward-circle-outline"
            size={50}
            color="#581845"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({});
