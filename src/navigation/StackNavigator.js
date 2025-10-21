import { StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LikeScreen from '../screens/LikeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import BasicInfo from '../screens/BasicInfo';
import NameScreen from '../screens/NameScreen';
import EmailScreen from '../screens/EmailScreen';
import OtpScreen from '../screens/OtpScreen';
import PasswordScreen from '../screens/PasswordScreen';
import DOBScreen from '../screens/DOBScreen';
import LocationScreen from '../screens/LocationScreen';
import GenderScreen from '../screens/GenderScreen';
import TypeScreen from '../screens/TypeScreen';
import DatingTypeScreen from '../screens/DatingTypeScreen';
import LookingForScreen from '../screens/LookingForScreen';
import HomeTownScreeen from '../screens/HomeTownScreeen';
import WorkplaceScreen from '../screens/WorkplaceScreen';
import JobTitleScreen from '../screens/JobTitleScreen';
import PhotosScreen from '../screens/PhotosScreen';
import PromptScreen from '../screens/PromptScreen';
import ShowPromptScreen from '../screens/ShowPromptScreen';
import WritePromptScren from '../screens/WritePromptScren';
import PreFinalScreen from '../screens/PreFinalScreen';
import { AuthContext } from '../../AuthContext';
const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const { token } = useContext(AuthContext);
  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={() => ({
          tabBarShowLabel: false,
          tabBarStyle: { height: 90 },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarStyle: { backgroundColor: '#101010' },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons
                  name="shuffle-outline"
                  size={30}
                  color="white"
                  style={{ paddingTop: 3 }}
                />
              ) : (
                <Ionicons
                  name="shuffle-outline"
                  size={30}
                  color="gray"
                  style={{ paddingTop: 3 }}
                />
              ),
          }}
        />
        <Tab.Screen
          name="Likes"
          component={LikeScreen}
          options={{
            tabBarStyle: { backgroundColor: '#101010' },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons
                  name="heart"
                  size={30}
                  color="white"
                  style={{ paddingTop: 3 }}
                />
              ) : (
                <Ionicons
                  name="heart"
                  size={30}
                  color="#989898"
                  style={{ paddingTop: 3 }}
                />
              ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarStyle: { backgroundColor: '#101010' },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons
                  name="chatbox-outline"
                  size={30}
                  color="white"
                  style={{ paddingTop: 3 }}
                />
              ) : (
                <Ionicons
                  name="chatbox-outline"
                  size={30}
                  color="#989898"
                  style={{ paddingTop: 3 }}
                />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarStyle: { backgroundColor: '#101010' },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons
                  name="person-outline"
                  size={30}
                  color="white"
                  style={{ paddingTop: 3 }}
                />
              ) : (
                <Ionicons
                  name="person-outline"
                  size={30}
                  color="#989898"
                  style={{ paddingTop: 3 }}
                />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }

  const AuthStack = () => {
    return (
      <Stack.Navigator>
        {/* <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="Basic"
          component={BasicInfo}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Name"
          component={NameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Email"
          component={EmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Password"
          component={PasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Birth"
          component={DOBScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Gender"
          component={GenderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Type"
          component={TypeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dating"
          component={DatingTypeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LookingFor"
          component={LookingForScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Hometown"
          component={HomeTownScreeen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Workplace"
          component={WorkplaceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JobTitle"
          component={JobTitleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Photos"
          component={PhotosScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Prompts"
          component={PromptScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShowPrompts"
          component={ShowPromptScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WritePrompt"
          component={WritePromptScren}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PreFinal"
          component={PreFinalScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };

  function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }
  return (
    <NavigationContainer>
      {token == null || token == '' ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
