import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LiveQuizRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { username } = useUser();
  const { isDarkMode, colors } = useTheme();

  const [timeLeft, setTimeLeft] = useState(10);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('Loading...');
  const roomId = (params.roomId as string) || (params.id as string) || '111111';

  useFocusEffect(
    React.useCallback(() => {
      setTimeLeft(10);
      setHasInitialized(true);
      setConnectedUsers([]);

      const newSocket = io('https://quizzer-paov.onrender.com', {
        transports: ['websocket', 'polling'],
        timeout: 10000
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', { roomId, username });
      });

      newSocket.on('error', (error) => {
        console.error('Room screen: Socket error:', error);
      });

      newSocket.on('roomState', (data) => {
        setConnectedUsers(data.users || []);
        if (data.quizTitle) {
          setQuizTitle(data.quizTitle);
        }
      });

      newSocket.emit('getQuiz', { roomId });

      newSocket.on('quizData', (data) => {
        if (data && data.quiz) {
          setQuizTitle(data.quiz.title);
        }
      });

      newSocket.on('userJoined', (data) => {
        setConnectedUsers(data.users || []);
      });

      newSocket.on('userLeft', (data) => {
        setConnectedUsers(data.users || []);
      });

      return () => {
        newSocket.off('error');
        newSocket.off('roomState');
        newSocket.off('userJoined');
        newSocket.off('userLeft');
        newSocket.off('quizData');
        newSocket.disconnect();
      };
    }, [roomId])
  );

  useEffect(() => {
    if (!hasInitialized) return;

    if (timeLeft === 0) {
      setHasInitialized(false);
      router.push({ pathname: '/quiz', params: { roomId } });
      return;
    }
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, router, roomId, hasInitialized]);

  const players = connectedUsers.map((user, index) => ({
    id: index.toString(),
    name: user,
    tag: user === username ? 'YOU' : null
  }));

  function back() {
    setHasInitialized(false);
    router.back();
  }

  // Dynamic styles based on theme
  const dynamicStyles = {
    safe: { flex: 1, backgroundColor: colors.background },
    backBtn: { ...styles.backBtn, backgroundColor: colors.cardBg },
    backText: { ...styles.backText, color: colors.primaryText },
    codeBadge: { ...styles.codeBadge, backgroundColor: colors.cardBg },
    title: { ...styles.title, color: colors.primaryText },
    subtitle: { ...styles.subtitle, color: colors.secondaryText },
    statusPill: { ...styles.statusPill, backgroundColor: colors.cardBg },
    statusText: { ...styles.statusText, color: isDarkMode ? '#cbd5f5' : colors.secondaryText },
    playersTitle: { ...styles.playersTitle, color: colors.primaryText },
    countBadge: { ...styles.countBadge, backgroundColor: colors.cardBg },
    countText: { ...styles.countText, color: colors.secondaryText },
    avatar: { ...styles.avatar, backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' },
    emptyAvatar: { ...styles.emptyAvatar, backgroundColor: isDarkMode ? '#020617' : '#f1f5f9', borderColor: colors.border },
    avatarText: { ...styles.avatarText, color: colors.primaryText },
    playerName: { ...styles.playerName, color: isDarkMode ? '#cbd5f5' : colors.secondaryText },
    countdownLabel: { ...styles.countdownLabel, color: colors.secondaryText },
    leaveText: { ...styles.leaveText, color: colors.secondaryText },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={dynamicStyles.backBtn} onPress={back}>
            <Text style={dynamicStyles.backText}>←</Text>
          </TouchableOpacity>
          <View style={dynamicStyles.codeBadge}>
            <Text style={styles.codeText}>Code: {roomId}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={dynamicStyles.title}>{quizTitle}</Text>
        <Text style={dynamicStyles.subtitle}>Hosted by @QuizMaster</Text>

        {/* Status */}
        <View style={dynamicStyles.statusPill}>
          <View style={styles.dot} />
          <Text style={dynamicStyles.statusText}>Waiting for Host...</Text>
        </View>

        {/* Players */}
        <View style={styles.playersHeader}>
          <Text style={dynamicStyles.playersTitle}>Players Joined</Text>
          <View style={dynamicStyles.countBadge}>
            <Text style={dynamicStyles.countText}>{players.length}</Text>
          </View>
        </View>

        <View style={styles.playersGrid}>
          {players.map((p) => (
            <View key={p.id} style={styles.playerItem}>
              <View style={dynamicStyles.avatar}>
                <Text style={dynamicStyles.avatarText}>{p.name[0]}</Text>
                {p.tag === 'YOU' && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>YOU</Text>
                  </View>
                )}
              </View>
              <Text style={dynamicStyles.playerName}>{p.name}</Text>
            </View>
          ))}

          {/* Empty Slot */}
          <View style={styles.playerItem}>
            <View style={[dynamicStyles.avatar, dynamicStyles.emptyAvatar]}>
              <Text style={{ color: colors.secondaryText }}>+</Text>
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownBox}>
          <Text style={dynamicStyles.countdownLabel}>STARTING IN</Text>
          <Text style={styles.countdownTime}>{String(Math.floor(timeLeft / 60)).padStart(2, '0')} : {String(timeLeft % 60).padStart(2, '0')}</Text>
        </View>

        {/* Leave */}
        <TouchableOpacity style={styles.leaveBtn} onPress={back}>
          <Text style={dynamicStyles.leaveText}>Leave Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18 },

  codeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  codeText: { color: '#60a5fa', fontWeight: '600' },

  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },

  statusPill: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 8,
  },
  statusText: { fontSize: 13 },

  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  playersTitle: { fontSize: 16, fontWeight: '700' },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 12 },

  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
  playerItem: { width: '22%', alignItems: 'center' },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyAvatar: { borderWidth: 1 },

  avatarText: { fontSize: 20, fontWeight: '700' },

  youBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  playerName: { fontSize: 12, marginTop: 6 },

  countdownBox: { alignItems: 'center', marginBottom: 20 },
  countdownLabel: { fontSize: 12, marginBottom: 6 },
  countdownTime: { color: '#38bdf8', fontSize: 28, fontWeight: '800' },

  leaveBtn: { alignSelf: 'center', marginTop: 10 },
  leaveText: { textDecorationLine: 'underline' },
});
