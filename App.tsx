import React from 'react';
import {AuthProvider} from './AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from './src/navigation/StackNavigator';
export default function App() {
  return (
  <AuthProvider>
    
        <StackNavigator />
       
      
    </AuthProvider>
  );
}
