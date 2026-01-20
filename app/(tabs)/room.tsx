import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

// Live Quiz Waiting Room Screen
// Navigate to this screen after pressing "Enter Game"

export default function LiveQuizRoomScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(10);

  // Reset timer when component mounts
  useEffect(() => {
    setTimeLeft(10);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/quiz');
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, router]);
  const players = [
    { id: 'you', name: 'Alex', tag: 'YOU' },
    { id: '1', name: 'Sarah' },
    { id: '2', name: 'Mike' },
    { id: '3', name: 'Jessica' },
    { id: '4', name: 'Ryan' },
    { id: '5', name: 'Emma' },
    { id: '6', name: 'David' },
  ];


  function back() {
    router.back();
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>Code: 8392</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Global Geography</Text>
        <Text style={styles.subtitle}>Hosted by @QuizMaster</Text>

        {/* Status */}
        <View style={styles.statusPill}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Waiting for Host...</Text>
        </View>

        {/* Players */}
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>Players Joined</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>12</Text>
          </View>
        </View>

        <View style={styles.playersGrid}>
          {players.map((p) => (
            <View key={p.id} style={styles.playerItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.name[0]}</Text>
                {p.tag === 'YOU' && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>YOU</Text>
                  </View>
                )}
              </View>
              <Text style={styles.playerName}>{p.name}</Text>
            </View>
          ))}

          {/* Empty Slot */}
          <View style={styles.playerItem}>
            <View style={[styles.avatar, styles.emptyAvatar]}>
              <Text style={{ color: '#64748b' }}>+</Text>
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>STARTING IN</Text>
          <Text style={styles.countdownTime}>{String(Math.floor(timeLeft / 60)).padStart(2, '0')} : {String(timeLeft % 60).padStart(2, '0')}</Text>
        </View>

        {/* Leave */}
        <TouchableOpacity style={styles.leaveBtn} onPress={back}>
          <Text style={styles.leaveText}>Leave Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071025' },
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
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 18 },

  codeBadge: {
    backgroundColor: '#0b1220',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  codeText: { color: '#60a5fa', fontWeight: '600' },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },

  statusPill: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#0b1220',
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
  statusText: { color: '#cbd5f5', fontSize: 13 },

  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  playersTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  countBadge: {
    backgroundColor: '#0b1220',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { color: '#94a3b8', fontSize: 12 },

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
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyAvatar: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#0f172a' },

  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  youBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  playerName: { color: '#cbd5f5', fontSize: 12, marginTop: 6 },

  countdownBox: { alignItems: 'center', marginBottom: 20 },
  countdownLabel: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  countdownTime: { color: '#38bdf8', fontSize: 28, fontWeight: '800' },

  leaveBtn: { alignSelf: 'center', marginTop: 10 },
  leaveText: { color: '#94a3b8', textDecorationLine: 'underline' },
});
