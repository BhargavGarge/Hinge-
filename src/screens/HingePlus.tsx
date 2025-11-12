import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useContext } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../../AuthContext';

type RootStackParamList = {
  Subscription: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Plan {
  id: string;
  plan: string;
  price: string;
  name: string;
}

const HingePlus = () => {
  const plans: Plan[] = [
    {
      id: '0',
      plan: '1 week',
      price: '1650.00/wk',
      name: 'New',
    },
    {
      id: '1',
      plan: '1 month',
      price: '3450.00/wk',
      name: 'Save 51%',
    },
    {
      id: '2',
      plan: '3 months',
      price: '2133.33/wk',
      name: 'Save 70%',
    },
    {
      id: '3',
      plan: '6 months',
      price: '1633.33/wk',
      name: 'Save 77%',
    },
  ];

  const navigation = useNavigation<NavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useContext(AuthContext);

  const pay = async () => {
    if (!selectedPlan) return;

    try {
      setIsLoading(true);

      const options = {
        description: 'Adding To Wallet',
        currency: 'INR',
        name: 'Hinge',
        key: 'rzp_test_E3GWYimxN7YMk8',
        amount: parseFloat(selectedPlan.price.split('/')[0]) * 100,
        prefill: {
          email: 'void@razorpay.com',
          contact: '9191919191',
          name: 'RazorPay Software',
        },
        theme: { color: '#900C3F' },
      };

      // Uncomment when Razorpay is installed
      // const data = await RazorpayCheckout.open(options);
      const token = await AsyncStorage.getItem('token');

      const type = 'Hinge plus';

      const response = await axios.post(
        `${BASE_URL}/subscribe`,
        {
          userId,
          plan: selectedPlan,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status == 200) {
        Alert.alert('Success', 'You have been subscribed to Hinge Plus', [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        console.log('Error creating order', response.data);
      }
    } catch (error) {
      console.log('Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView>
        <View
          style={{
            marginTop: 10,
            flex: 1,
            padding: 12,
            backgroundColor: 'white',
          }}
        >
          <ImageBackground
            resizeMode="cover"
            imageStyle={{ borderRadius: 10, marginTop: 10, opacity: 0.9 }}
            style={{ height: 200, width: '100%' }}
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSs48AlXs6q_E_rz9UGJDy8wyj6-Mft76F2wHjs2uboOn-TDF-XMfXSeiYNi0L_3sWQFY&usqp=CAU',
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  color: 'white',
                  fontWeight: 'bold',
                  width: 200,
                }}
              >
                See everyone who likes you
              </Text>
            </View>
          </ImageBackground>

          <View style={{ marginTop: 25 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {plans?.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedPlan(item)}
                  style={{ marginRight: 10 }}
                >
                  <View
                    style={{
                      backgroundColor:
                        selectedPlan?.name === item?.name
                          ? '#8e33b5'
                          : '#B0B0B0',
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '500',
                      }}
                    >
                      {item?.name}
                    </Text>
                  </View>

                  <View
                    style={{
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      borderColor:
                        selectedPlan?.name === item?.name
                          ? '#8e33b5'
                          : '#E0E0E0',
                      borderWidth: 2,
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                    }}
                  >
                    <Text style={{ color: 'gray', fontSize: 15 }}>
                      {item?.plan}
                    </Text>

                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '600',
                        marginTop: 8,
                        letterSpacing: 0.6,
                      }}
                    >
                      {item?.price}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={{ marginTop: 30 }}>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Ionicons name="infinite-outline" size={22} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 8,
                  letterSpacing: 0.6,
                }}
              >
                Send unlimited likes*
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 14, marginVertical: 15 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Ionicons name="person-outline" size={22} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 8,
                  letterSpacing: 0.6,
                }}
              >
                See everyone who likes you
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Ionicons name="filter-outline" size={22} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 8,
                  letterSpacing: 0.6,
                }}
              >
                Set more dating preferences
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 14, marginVertical: 15 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Ionicons name="funnel-outline" size={22} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 8,
                  letterSpacing: 0.6,
                }}
              >
                Sort all incoming likes
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#E0E0E0',
                }}
              >
                <Ionicons name="search-outline" size={22} color="black" />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  marginTop: 8,
                  letterSpacing: 0.6,
                }}
              >
                Browse by who's new or nearby
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {selectedPlan && (
        <Pressable
          onPress={pay}
          style={{
            backgroundColor: '#8e33b5',
            marginTop: 'auto',
            marginBottom: 10,
            padding: 12,
            marginHorizontal: 10,
            borderRadius: 20,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: 0.6,
                color: 'white',
              }}
            >
              Get {selectedPlan?.plan} for {selectedPlan?.price}
            </Text>
          )}
        </Pressable>
      )}
    </>
  );
};

export default HingePlus;

const styles = StyleSheet.create({});
