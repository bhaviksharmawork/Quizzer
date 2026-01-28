import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

// Single-file React Native screen that visually clones the provided design.
// Drop this file into your Expo app (e.g. /app/(screens)/LiveQuizHomeScreen.tsx) and import it in your router.

// Type for quiz data
interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  questions: any[];
}

export default function LiveQuizHomeScreen() {
  const router = useRouter();
  const { username } = useUser();
  console.log('🏠 HOME SCREEN - Username from context:', username);
  console.log('🏠 HOME SCREEN - Username type:', typeof username);
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  // Fetch quizzes from remote server
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Fetch quizzes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchQuizzes = async () => {
        try {
          setLoadingQuizzes(true);
          const response = await fetch('https://quizzer-paov.onrender.com/api/quizzes');
          const data = await response.json();
          setQuizzes(data.quizzes || []);
          console.log('🏠 HOME SCREEN - Fetched quizzes:', data.quizzes?.length || 0);
        } catch (error) {
          console.error('Error fetching quizzes:', error);
          setQuizzes([]);
        } finally {
          setLoadingQuizzes(false);
        }
      };
      fetchQuizzes();
    }, [])
  );

  const categories = [
    { id: '1', name: 'Science', emoji: '⚗️', color: '#7c3aed' },
    { id: '2', name: 'History', emoji: '🧾', color: '#fb923c' },
    { id: '3', name: 'Tech', emoji: '⚙️', color: '#06b6d4' },
    { id: '4', name: 'Sports', emoji: '🏆', color: '#f97316' },
  ];

  function handlePinChange(text: string, index: number) {
    if (text.length > 1) text = text.slice(-1);
    const next = [...pin];
    next[index] = text;
    setPin(next);
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      // on backspace, focus previous
    }
  }

  function joinGame() {
    const code = pin.join('');
    console.log('🏠 HOME SCREEN: Join code:', code);
    console.log('🏠 HOME SCREEN: Navigating to room with roomId:', code);
    console.log('🏠 HOME SCREEN: Navigation path: room');
    // Navigate to room with the room code using relative path within tabs
    router.push({ pathname: '/room', params: { roomId: code } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <View>
              <Text style={styles.welcome}>Welcome back,</Text>
              <Text style={styles.username}>{username || 'Guest'}</Text>
            </View>
          </View>
          <View style={styles.bell}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </View>
        </View>

        {/* Join Card */}
        <View style={styles.joinCard}>
          <View style={styles.joinIcon}>
            <Text style={{ fontSize: 20 }}>🎮</Text>
          </View>
          <Text style={styles.joinTitle}>Join a Live Game</Text>
          <Text style={styles.joinSubtitle}>Enter the 6-digit PIN provided by the host</Text>

          <View style={styles.pinRow}>
            {Array.from({ length: 6 }).map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputs.current[i] = ref;
                }}
                value={pin[i]}
                onChangeText={(t) => handlePinChange(t, i)}
                style={styles.pinBox}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                placeholder="•"
                placeholderTextColor="#6b7280"
              />
            ))}
          </View>

          <TouchableOpacity style={styles.enterBtn} onPress={joinGame}>
            <Text style={styles.enterBtnText}>Enter Game →</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Categories */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Trending Categories</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {categories.map((c) => (
            <View key={c.id} style={[styles.categoryCard, { backgroundColor: '#0b1220' }]}>
              <View style={[styles.categoryIcon, { backgroundColor: c.color }]}>
                <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{c.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Available Quizzes */}
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Available Quizzes</Text>
        <View style={{ gap: 12 }}>
          {quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.eventCard}
              onPress={() => router.push({ pathname: '/room', params: { roomId: quiz.id } })}
            >
              <View style={styles.eventLeft}>
                <View style={styles.quizCodeBadge}>
                  <Text style={styles.quizCodeText}>{quiz.id}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.eventTitle}>{quiz.title}</Text>
                  <Text style={styles.eventMeta}>{quiz.category} • {quiz.difficulty}</Text>
                  <Text style={styles.quizQuestionCount}>{quiz.questions.length} Questions</Text>
                </View>
              </View>

              <View style={styles.joinQuizBtn}>
                <Text style={styles.joinQuizBtnText}>Join →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation + Floating Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Discover</Text>
        </TouchableOpacity>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton} onPress={() => router.push('/addquiz')}>
            <Text style={styles.fabPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navLabel}>Rank</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071025' },
  container: {
    padding: 18,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#001219', fontWeight: '700' },
  welcome: { color: '#94a3b8', fontSize: 12 },
  username: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },

  joinCard: {
    backgroundColor: '#0b1220',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  joinIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  joinTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  joinSubtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 12 },
  pinRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pinBox: {
    width: 44,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#021124',
    borderWidth: 1,
    borderColor: '#0f172a',
    color: '#fff',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterBtn: {
    marginTop: 6,
    backgroundColor: '#2b6cb0',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  enterBtnText: { color: '#f8fafc', fontWeight: '700' },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewAll: { color: '#60a5fa' },

  categoryCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  categoryIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { color: '#fff', fontWeight: '700', fontSize: 14 },

  eventCard: {
    backgroundColor: '#0b1220',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  eventThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: { color: '#fff', fontWeight: '700' },
  eventMeta: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  eventBell: { marginLeft: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#061223' },

  // Quiz code badge styles
  quizCodeBadge: {
    minWidth: 70,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quizCodeText: {
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  quizQuestionCount: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  joinQuizBtn: {
    backgroundColor: '#2b6cb0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  joinQuizBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  bottomBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    height: 66,
    backgroundColor: '#071425',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 18 },
  navLabel: { color: '#94a3b8', fontSize: 11 },
  fabContainer: {
    position: 'relative',
    top: -28,
    alignSelf: 'center',
  },

  fabButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2b6cb0', alignItems: 'center', justifyContent: 'center' },
  fabPlus: { color: '#fff', fontSize: 28, lineHeight: 28 },
});