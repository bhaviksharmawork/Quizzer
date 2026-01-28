import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

// Username-only Login / Join Screen

export default function UsernameLoginScreen() {
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUsername } = useUser();

  const handleLogin = async () => {
    if (!usernameInput.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setLoading(true);

    try {
      // Save username using UserContext (which also persists to AsyncStorage)
      await setUsername(usernameInput.trim());

      // Navigate to home page (replace to prevent going back to login)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving username:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.centerContent}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Enter your username to join the game.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Username..."
            placeholderTextColor="#64748b"
            value={usernameInput}
            onChangeText={setUsernameInput}
            editable={!loading}
            maxLength={20}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.continueBtn,
              (!usernameInput || loading) && styles.continueDisabled,
            ]}
            disabled={!usernameInput || loading}
            onPress={handleLogin}
          >
            <Text style={styles.continueText}>
              {loading ? 'Logging in...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Joining as a guest. Your progress will be saved locally.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PRIVACY POLICY</Text>
          <Text style={styles.footerText}>TERMS OF USE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071025' },
  container: { flex: 1, padding: 20 },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#cbd5f5', fontSize: 18 },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },

  input: {
    width: '100%',
    backgroundColor: '#0b1220',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },

  continueBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: { color: '#fff', fontWeight: '700' },

  helperText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
  },
});