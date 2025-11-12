import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import {
  TabBar,
  TabView,
  Route,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { BASE_URL } from '../url/url';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomModal } from 'react-native-modals';
import { SlideAnimation } from 'react-native-modals';
import { ModalContent } from 'react-native-modals';

type RootStackParamList = {
  Subscription: undefined;
  ProfileDetail: { userInfo: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RoseItem {
  id: string;
  plan: string;
  price: string;
}

interface TabRoute extends Route {
  key: 'getMore' | 'safety' | 'myHinge';
  title: string;
}

const ProfileScreen = () => {
  const { userId, userInfo, setUserInfo } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [plan, setPlan] = useState('');
  const [index, setIndex] = useState(0);

  // These would typically come from your context or API
  const [isActive] = useState(false);
  const [planName] = useState('');

  const roses: RoseItem[] = [
    {
      id: '1',
      plan: '3 Roses',
      price: '283.33 each',
    },
    {
      id: '2',
      plan: '12 Roses',
      price: '283.33 each',
    },
    {
      id: '3',
      plan: '50 Roses',
      price: '283.33 each',
    },
  ];

  const getUserDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user-info`, {
        params: { userId },
      });

      if (response.status === 200) {
        const userData = response.data.user;

        // Only update state if the data is different
        if (JSON.stringify(userData) !== JSON.stringify(userInfo)) {
          setUserInfo(userData);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        getUserDetails();
      }
    }, [userId]),
  );

  const [routes] = useState<TabRoute[]>([
    { key: 'getMore', title: 'Get More' },
    { key: 'safety', title: 'Safety' },
    { key: 'myHinge', title: 'My Hinge' },
  ]);

  const pay = (item: RoseItem) => {
    // Implement payment logic here
    console.log('Selected plan:', item);
  };

  const GetMore = ({
    modalVisible,
    setModalVisible,
  }: {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
  }) => (
    <View style={{ flex: 1, marginTop: 30, marginHorizontal: 20 }}>
      <Pressable onPress={() => navigation.navigate('Subscription')}>
        <Image
          style={{ height: 250, width: '100%', borderRadius: 10 }}
          source={{
            uri: 'https://cdn.sanity.io/images/l7pj44pm/production/5f4e26a82da303138584cff340f3eff9e123cd56-1280x720.jpg',
          }}
        />
      </Pressable>

      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 10,
          borderRadius: 10,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: '#0a7064',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="infinite-outline" size={22} color="white" />
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600' }}>Boost</Text>
          <Text style={{ color: '#282828', marginTop: 3 }}>
            Get seen by 11x more people
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderColor: '#E0E0E0',
          borderWidth: 1,
          padding: 10,
          borderRadius: 10,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            backgroundColor: '#d4abde',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="rose-outline" size={22} color="white" />
        </View>
        <Pressable onPress={() => setModalVisible(!modalVisible)}>
          <Text style={{ fontSize: 15, fontWeight: '600' }}>Roses</Text>
          <Text style={{ color: '#282828', marginTop: 3 }}>
            2x as likely to lead to a date
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const Safety = () => (
    <ScrollView>
      <View style={{ marginTop: 10, marginHorizontal: 20, flex: 1 }}>
        <View
          style={{
            marginVertical: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="check-decagram-outline" size={22} color="black" />
          </View>

          <View>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>
              Selfie Verification
            </Text>
            <Text style={{ color: '#282828', marginTop: 3 }}>
              You're not verified yet
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="eye-off" size={22} color="black" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>
              Hidden words
            </Text>
            <Text style={{ color: '#282828', marginTop: 3 }}>
              Hide likes with offensive words
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'white',
            marginVertical: 20,
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="lock" size={22} color="black" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>Block List</Text>
            <Text style={{ color: '#282828', marginTop: 3 }}>
              Block People you know
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 20, fontWeight: '500' }}>
          Explore safety resources
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginVertical: 12,
          }}
        >
          <View
            style={{
              padding: 14,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderColor: '#E0E0E0',
              borderWidth: 0.7,
              backgroundColor: 'white',
              flex: 1,
            }}
          >
            <Ionicons name="phone-outline" size={22} color="black" />
            <Text style={{ fontSize: 17, fontWeight: '500' }}>
              Crisis Hotlines
            </Text>
          </View>

          <View
            style={{
              padding: 14,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderColor: '#E0E0E0',
              borderWidth: 0.7,
              backgroundColor: 'white',
              flex: 1,
            }}
          >
            <Ionicons name="help-box" size={22} color="black" />
            <Text>Help Center</Text>
          </View>
        </View>

        <View
          style={{
            padding: 12,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 15,
            backgroundColor: 'white',
            borderColor: '#E0E0E0',
            borderWidth: 0.7,
            borderRadius: 8,
          }}
        >
          <Image
            style={{ width: 100, height: 100, borderRadius: 50 }}
            source={{
              uri: 'https://images.hinge.co/6e7d61055e6f7783f84a1e41bc85aa3807f9ddba-1200x1094.jpg?w=1200&q=75',
            }}
          />
          <Text
            style={{ textAlign: 'center', fontSize: 19, fontWeight: 'bold' }}
          >
            Safe Dating Advice
          </Text>

          <Text style={{ textAlign: 'center', color: '#282828', fontSize: 15 }}>
            Our guide for how to stay safe without losing the momentum
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const MyHinge = () => (
    <ScrollView>
      <View style={{ marginTop: 10, marginHorizontal: 20, flex: 1 }}>
        <View
          style={{
            marginVertical: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderColor: '#E0E0E0',
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="help" size={22} color="black" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>Help Center</Text>
            <Text style={{ color: '#282828', marginTop: 3 }}>
              Safety, Security and more
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderColor: '#E0E0E0',
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="alarm-light-outline" size={22} color="black" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>What works</Text>
            <Text style={{ color: '#282828', marginTop: 3 }}>
              Check out our expert dating tips
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: 12,
            marginVertical: 12,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 15,
            backgroundColor: 'white',
            borderColor: '#E0E0E0',
            borderWidth: 0.7,
            borderRadius: 7,
          }}
        >
          <Image
            style={{ width: 100, height: 100, borderRadius: 50 }}
            source={{
              uri: 'https://images.hinge.co/6e7d61055e6f7783f84a1e41bc85aa3807f9ddba-1200x1094.jpg?w=1200&q=75',
            }}
          />

          <Text
            style={{ textAlign: 'center', fontSize: 19, fontWeight: 'bold' }}
          >
            Try a fresh photo
          </Text>

          <Text style={{ textAlign: 'center', color: '#282828', fontSize: 15 }}>
            Show people your latest and greatest by adding a new photo
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderScene = ({ route }: { route: TabRoute }) => {
    switch (route.key) {
      case 'getMore':
        return (
          <GetMore
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
        );
      case 'safety':
        return <Safety />;
      case 'myHinge':
        return <MyHinge />;
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> },
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'black' }}
      style={{ backgroundColor: '#F8F8F8' }}
      labelStyle={{ fontWeight: 'bold' }}
      activeColor="black"
      inactiveColor="gray"
    />
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <View
          style={{
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold' }}>
              HINGE
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable>
              <Image
                style={{ width: 30, height: 30 }}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/7854/7854753.png',
                }}
              />
            </Pressable>
            <Pressable>
              <Image
                style={{ width: 30, height: 30 }}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/1827/1827737.png',
                }}
              />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            marginVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() =>
              navigation.navigate('ProfileDetail', {
                userInfo: userInfo,
              })
            }
          >
            <Image
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                resizeMode: 'cover',
                borderColor: 'purple',
                borderWidth: 3,
              }}
              source={{ uri: userInfo?.imageUrls?.[1] }}
            />
          </Pressable>

          <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '500' }}>
            {userInfo?.firstName}
          </Text>

          {isActive && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 25,
                backgroundColor: 'purple',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {planName}
              </Text>
            </View>
          )}
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: '100%' }}
          renderTabBar={renderTabBar}
        />
      </SafeAreaView>

      <BottomModal
        swipeDirection={['up', 'down']}
        swipeThreshold={200}
        modalAnimation={
          new SlideAnimation({
            slideFrom: 'bottom',
          })
        }
        visible={modalVisible}
        onTouchOutside={() => setModalVisible(!modalVisible)}
      >
        <ModalContent style={{ width: '100%', height: 'auto' }}>
          <View>
            <Text
              style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}
            >
              Catch their eye by sending a rose
            </Text>
            <Text
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 15,
                color: '#181818',
                lineHeight: 22,
              }}
            >
              Roses are always seen first and are twice as likely to lead to a
              date. A purchased rose never expires
            </Text>

            <ScrollView
              contentContainerStyle={{ marginTop: 30, marginBottom: 30 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {roses?.map((item, index) => (
                <Pressable
                  style={{
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#E0E0E0',
                    borderWidth: 0.6,
                    marginRight: 20,
                    borderRadius: 12,
                    width: 200,
                  }}
                  key={index}
                >
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {item?.plan}
                  </Text>

                  <Image
                    style={{ width: 60, height: 60, marginVertical: 15 }}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/4006/4006798.png',
                    }}
                  />

                  <Text style={{ fontSize: 15, fontWeight: '500' }}>
                    ₹ {item?.price}
                  </Text>

                  <Pressable
                    onPress={() => pay(item)}
                    style={{
                      backgroundColor: '#800080',
                      padding: 12,
                      borderRadius: 22,
                      marginTop: 10,
                      width: 110,
                    }}
                  >
                    <Text style={{ textAlign: 'center', color: 'white' }}>
                      Select
                    </Text>
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ModalContent>
      </BottomModal>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
