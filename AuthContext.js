import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🧩 useCallback ensures the function identity doesn't change on every render
  const fetchUserInfo = useCallback(async (userId, token) => {
    try {
      const response = await fetch(
        `http://192.168.1.146:9000/user-info?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
    const fetchUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          setAuthUser(storedToken);

          const decoded = jwtDecode(storedToken);
          if (decoded?.userId) {
            setUserId(decoded.userId);
            await fetchUserInfo(decoded.userId, storedToken);
          }
        }
      } catch (error) {
        console.error('Error fetching token from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [fetchUserInfo]);

  const login = async newToken => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      setAuthUser(newToken);

      const decoded = jwtDecode(newToken);
      if (decoded?.userId) {
        setUserId(decoded.userId);
        await fetchUserInfo(decoded.userId, newToken);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken('');
      setUserId('');
      setUserInfo(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
