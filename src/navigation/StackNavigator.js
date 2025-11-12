import { ActivityIndicator, View } from 'react-native';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SendLikeScreen from '../screens/SendLikeScreen';
import HomeScreen from '../screens/HomeScreen';
import LikeScreen from '../screens/LikeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import BasicInfo from '../screens/BasicInfo';
import NameScreen from '../screens/NameScreen';
import EmailScreen from '../screens/EmailScreen';
import OtpScreen from '../screens/OtpScreen';
import PasswordScreen from '../screens/PasswordScreen';
import LocationScreen from '../screens/LocationScreen';
import GenderScreen from '../screens/GenderScreen';
import TypeScreen from '../screens/TypeScreen';
import DOBScreen from '../screens/DOBScreen';
import LookingFor from '../screens/LookingForScreen';
import HomeTownScreen from '../screens/HomeTownScreeen';
import WorkPlace from '../screens/WorkplaceScreen';
import JobTitleScreen from '../screens/JobTitleScreen';
import PhotoScreen from '../screens/PhotosScreen';
import PromptsScreen from '../screens/PromptScreen';
import ShowPromptsScreen from '../screens/ShowPromptScreen';
import WritePrompt from '../screens/WritePromptScren';
import PreFinalScreen from '../screens/PreFinalScreen';
import DatingType from '../screens/DatingTypeScreen';
import HandleLikeScreen from '../screens/HandleLikeScreen';
import ChatRoom from '../screens/ChatRoom';
import SubscriptionScreen from '../screens/SubscriptionScreen';

// import all your screens as before...

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const { token, isLoading } = useContext(AuthContext);

  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { height: 90, backgroundColor: '#101010' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="shuffle-outline"
                size={30}
                color={focused ? 'white' : 'gray'}
                style={{ paddingTop: 3 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Likes"
          component={LikeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="heart"
                size={30}
                color={focused ? 'white' : '#989898'}
                style={{ paddingTop: 3 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="chatbox-outline"
                size={30}
                color={focused ? 'white' : '#989898'}
                style={{ paddingTop: 3 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="person-outline"
                size={30}
                color={focused ? 'white' : '#989898'}
                style={{ paddingTop: 3 }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Basic" component={BasicInfo} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Email" component={EmailScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
      <Stack.Screen name="Birth" component={DOBScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Type" component={TypeScreen} />
      <Stack.Screen name="Dating" component={DatingType} />
      <Stack.Screen name="LookingFor" component={LookingFor} />
      <Stack.Screen name="Hometown" component={HomeTownScreen} />
      <Stack.Screen name="Workplace" component={WorkPlace} />
      <Stack.Screen name="JobTitle" component={JobTitleScreen} />
      <Stack.Screen name="Photos" component={PhotoScreen} />
      <Stack.Screen name="Prompts" component={PromptsScreen} />
      <Stack.Screen name="ShowPrompts" component={ShowPromptsScreen} />
      <Stack.Screen name="WritePrompt" component={WritePrompt} />
      <Stack.Screen name="PreFinal" component={PreFinalScreen} />
    </Stack.Navigator>
  );

  const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen
        name="SendLike"
        component={SendLikeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HandleLike"
        component={HandleLikeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );

  // 🕒 Wait for AuthContext to finish checking AsyncStorage
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token == null || token === '' ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
};

export default StackNavigator;
