import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { isDarkMode, toggleTheme, colors } = useTheme();
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

  function handlePinChange(text: string, index: number) {
    if (text.length > 1) text = text.slice(-1);
    const next = [...pin];
    next[index] = text;
    setPin(next);
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function joinGame() {
    const code = pin.join('');
    router.push({ pathname: '/room', params: { roomId: code } });
  }

  // Dynamic styles based on theme
  const dynamicStyles = {
    safe: { flex: 1, backgroundColor: colors.background },
    avatar: { ...styles.avatar, backgroundColor: colors.avatarBg },
    welcome: { ...styles.welcome, color: colors.secondaryText },
    username: { ...styles.username, color: colors.primaryText },
    bell: { ...styles.bell, backgroundColor: colors.cardBg },
    joinCard: { ...styles.joinCard, backgroundColor: colors.cardBg },
    joinIcon: { ...styles.joinIcon, backgroundColor: colors.cardBg, borderColor: colors.border },
    joinTitle: { ...styles.joinTitle, color: colors.primaryText },
    joinSubtitle: { ...styles.joinSubtitle, color: colors.secondaryText },
    pinBox: { ...styles.pinBox, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.primaryText },
    enterBtn: { ...styles.enterBtn, backgroundColor: colors.accent },
    sectionTitle: { ...styles.sectionTitle, color: colors.primaryText },
    eventCard: { ...styles.eventCard, backgroundColor: colors.cardBg },
    eventTitle: { ...styles.eventTitle, color: colors.primaryText },
    eventMeta: { ...styles.eventMeta, color: colors.secondaryText },
    quizCodeBadge: { ...styles.quizCodeBadge, backgroundColor: isDarkMode ? '#1e3a5f' : '#dbeafe' },
    quizCodeText: { ...styles.quizCodeText, color: colors.accentLight },
    quizQuestionCount: { ...styles.quizQuestionCount, color: colors.secondaryText },
    joinQuizBtn: { ...styles.joinQuizBtn, backgroundColor: colors.accent },
    bottomBar: { ...styles.bottomBar, backgroundColor: isDarkMode ? '#071425' : '#ffffff', shadowColor: isDarkMode ? '#000' : '#94a3b8' },
    navLabel: { ...styles.navLabel, color: colors.secondaryText },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.userRow}>
            <View style={dynamicStyles.avatar}>
              <Text style={styles.avatarText}>{username ? username.slice(0, 2).toUpperCase() : 'AJ'}</Text>
            </View>
            <View>
              <Text style={dynamicStyles.welcome}>Welcome back,</Text>
              <Text style={dynamicStyles.username}>{username || 'Guest'}</Text>
            </View>
          </View>
          {/* Theme Toggle Switch */}
          <View style={styles.themeToggle}>
            <Text style={{ fontSize: 16 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e2e8f0', true: '#1e3a5f' }}
              thumbColor={isDarkMode ? '#3b82f6' : '#f8fafc'}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>

        {/* Join Card */}
        <View style={dynamicStyles.joinCard}>
          <View style={dynamicStyles.joinIcon}>
            <Text style={{ fontSize: 20 }}>🎮</Text>
          </View>
          <Text style={dynamicStyles.joinTitle}>Join a Live Game</Text>
          <Text style={dynamicStyles.joinSubtitle}>Enter the 6-digit PIN provided by the host</Text>

          <View style={styles.pinRow}>
            {Array.from({ length: 6 }).map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputs.current[i] = ref;
                }}
                value={pin[i]}
                onChangeText={(t) => handlePinChange(t, i)}
                style={dynamicStyles.pinBox}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                placeholder="•"
                placeholderTextColor={colors.secondaryText}
              />
            ))}
          </View>

          <TouchableOpacity style={dynamicStyles.enterBtn} onPress={joinGame}>
            <Text style={styles.enterBtnText}>Enter Game →</Text>
          </TouchableOpacity>
        </View>

        {/* Available Quizzes */}
        <Text style={[dynamicStyles.sectionTitle, { marginBottom: 12 }]}>Available Quizzes</Text>
        <View style={{ gap: 12 }}>
          {quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={dynamicStyles.eventCard}
              onPress={() => router.push({ pathname: '/room', params: { roomId: quiz.id } })}
            >
              <View style={styles.eventLeft}>
                <View style={dynamicStyles.quizCodeBadge}>
                  <Text style={dynamicStyles.quizCodeText}>{quiz.id}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={dynamicStyles.eventTitle}>{quiz.title}</Text>
                  <Text style={dynamicStyles.eventMeta}>{quiz.category} • {quiz.difficulty}</Text>
                  <Text style={dynamicStyles.quizQuestionCount}>{quiz.questions.length} Questions</Text>
                </View>
              </View>

              <View style={dynamicStyles.joinQuizBtn}>
                <Text style={styles.joinQuizBtnText}>Join →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation + Floating Action */}
      <View style={dynamicStyles.bottomBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={dynamicStyles.navLabel}>Home</Text>
        </TouchableOpacity>
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton} onPress={() => router.push('/addquiz')}>
            <Text style={styles.fabPlus}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={dynamicStyles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#001219', fontWeight: '700' },
  welcome: { fontSize: 12 },
  username: { fontWeight: '700', fontSize: 16 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  joinCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  joinIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  joinTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  joinSubtitle: { fontSize: 12, marginBottom: 12 },
  pinRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pinBox: {
    width: 44,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterBtn: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  enterBtnText: { color: '#f8fafc', fontWeight: '700' },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  viewAll: { color: '#60a5fa' },

  eventCard: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  eventTitle: { fontWeight: '700' },
  eventMeta: { fontSize: 12, marginTop: 6 },

  quizCodeBadge: {
    minWidth: 70,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quizCodeText: {
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  quizQuestionCount: {
    fontSize: 11,
    marginTop: 2,
  },
  joinQuizBtn: {
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
    height: 70,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 30,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  navIcon: { fontSize: 24 },
  navLabel: { fontSize: 13, marginTop: 4 },
  fabContainer: {
    position: 'relative',
    top: -28,
    alignSelf: 'center',
  },

  fabButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2b6cb0', alignItems: 'center', justifyContent: 'center' },
  fabPlus: { color: '#fff', fontSize: 28, lineHeight: 28 },
});