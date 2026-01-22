import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export default function IndexPage() {
  const { username, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (username) {
        // User is logged in, go to tabs
        router.replace('/(tabs)');
      } else {
        // User is not logged in, go to login
        router.replace('/login');
      }
    }
  }, [username, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting...</Text>
    </View>
  );
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
