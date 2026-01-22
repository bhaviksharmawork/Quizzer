import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    console.log('👤 USER CONTEXT - Loading username from AsyncStorage...');
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      console.log('👤 USER CONTEXT - Retrieved username:', savedUsername);
      if (savedUsername) {
        setUsernameState(savedUsername);
        console.log('👤 USER CONTEXT - Username set to:', savedUsername);
      } else {
        console.log('👤 USER CONTEXT - No username found in storage');
      }
    } catch (error) {
      console.error('Error loading username:', error);
    } finally {
      setIsLoading(false);
      console.log('👤 USER CONTEXT - Loading complete, isLoading set to false');
    }
  };

  const setUsername = async (newUsername: string) => {
    try {
      await AsyncStorage.setItem('username', newUsername);
      setUsernameState(newUsername);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      setUsernameState(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
