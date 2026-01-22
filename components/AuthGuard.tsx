import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@/contexts/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { username, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !username) {
      // Redirect to login if no username found
      router.replace('/(tabs)/login');
    }
  }, [username, isLoading]); // Remove router from dependencies

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!username) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Redirecting to login...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071025',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
