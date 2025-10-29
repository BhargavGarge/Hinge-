import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../url/url';
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token with backend
  const validateToken = async tokenToValidate => {
    try {
      console.log('🔐 Validating token with backend...');
      const response = await axios.get(`${BASE_URL}/verify-token`, {
        headers: { Authorization: `Bearer ${tokenToValidate}` },
        timeout: 10000, // 10 second timeout
      });

      console.log('✅ Token validation response:', response.status);
      return response.status === 200;
    } catch (error) {
      console.log(
        '❌ Token validation failed:',
        error.response?.status || error.message,
      );
      return false;
    }
  };

  // Check if token is expired locally
  const isTokenExpired = tokenToCheck => {
    try {
      const decoded = jwtDecode(tokenToCheck);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp < currentTime) {
        console.log('⏰ Token expired locally');
        return true;
      }
      return false;
    } catch (error) {
      console.log('❌ Error decoding token:', error);
      return true;
    }
  };

  const fetchUserInfo = useCallback(async (userId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/user-info?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setUserInfo(data.user);
      } else {
        console.warn('User info fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthContext: Initializing authentication...');
        const storedToken = await AsyncStorage.getItem('token');

        if (!storedToken) {
          console.log('❌ No token found in storage');
          setIsLoading(false);
          return;
        }

        console.log('📱 Token found in storage, length:', storedToken.length);

        // Step 1: Check local expiration first
        if (isTokenExpired(storedToken)) {
          console.log('🗑️ Removing expired token');
          await AsyncStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        // Step 2: Validate with backend
        console.log('🌐 Validating token with server...');
        const isValid = await validateToken(storedToken);

        if (!isValid) {
          console.log('🗑️ Removing invalid token');
          await AsyncStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        // Token is valid - proceed with login
        console.log('✅ Token is valid, setting up user session');
        setToken(storedToken);
        setAuthUser(storedToken);

        const decoded = jwtDecode(storedToken);
        if (decoded?.userId) {
          console.log('👤 User ID found:', decoded.userId);
          setUserId(decoded.userId);
          await fetchUserInfo(decoded.userId, storedToken);
        } else {
          console.log('❌ No user ID in token');
        }
      } catch (error) {
        console.error('🚨 Error during auth initialization:', error);
        // In case of any error, clear token and show login
        await AsyncStorage.removeItem('token');
      } finally {
        console.log('🏁 AuthContext initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserInfo]);

  const login = async newToken => {
    try {
      console.log('🔐 Login process started');
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      setAuthUser(newToken);

      const decoded = jwtDecode(newToken);
      if (decoded?.userId) {
        setUserId(decoded.userId);
        await fetchUserInfo(decoded.userId, newToken);
      }
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await AsyncStorage.removeItem('token');
      setToken('');
      setUserId('');
      setUserInfo(null);
      setAuthUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  // Debug function to clear storage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setToken('');
      setUserId('');
      setUserInfo(null);
      setAuthUser(null);
      console.log('🧹 Storage cleared');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userId,
        setUserId,
        authUser,
        setAuthUser,
        userInfo,
        setUserInfo,
        isLoading,
        login,
        logout,
        clearStorage, // Add this for debugging
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
