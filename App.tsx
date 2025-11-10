import React from 'react';
import { AuthProvider } from './AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from './src/navigation/StackNavigator';
import { SocketContextProvider } from './SocketContext';
export default function App() {
  return (
    <AuthProvider>
      <SocketContextProvider>
        <StackNavigator />
      </SocketContextProvider>
    </AuthProvider>
  );
}
