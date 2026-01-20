import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

// Live Quiz Result / Completion Screen

export default function LiveQuizResultScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Trophy */}
        <View style={styles.trophyWrapper}>
          <View style={styles.trophyCircle}>
            <Text style={styles.trophy}>🏆</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Well Done!</Text>
        <Text style={styles.subtitle}>You completed the quiz successfully.</Text>

        {/* Rank Card */}
        <View style={styles.rankCard}>
          <Text style={styles.rankLabel}>YOUR RANK</Text>
          <Text style={styles.rankValue}>4th Place</Text>
          <Text style={styles.rankMeta}>👥 124 others played</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statLabel}>Total Score</Text>
            <Text style={styles.statValue}>1,240 pts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>85%</Text>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>PERFORMANCE BREAKDOWN</Text>
          <Text style={styles.performanceSub}>15 Questions</Text>

          <View style={styles.progressBar}>
            <View style={[styles.correctBar, { width: '80%' }]} />
            <View style={[styles.incorrectBar, { width: '20%' }]} />
          </View>

          <View style={styles.performanceLegend}>
            <Text style={styles.correctText}>● CORRECT 12</Text>
            <Text style={styles.incorrectText}>● INCORRECT 3</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/')}>
          <Text style={styles.primaryText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>🔗 Share Result</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071025' },
  container: { flex: 1, padding: 20, alignItems: 'center' },

  trophyWrapper: { marginTop: 20, marginBottom: 20 },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophy: { fontSize: 32 },

  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8', marginTop: 6, marginBottom: 20 },

  rankCard: {
    width: '100%',
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  rankLabel: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  rankValue: { color: '#fff', fontSize: 28, fontWeight: '800' },
  rankMeta: { color: '#94a3b8', marginTop: 6 },

  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statLabel: { color: '#94a3b8', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 6 },

  performanceCard: {
    width: '100%',
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  performanceTitle: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  performanceSub: { color: '#fff', fontWeight: '700', marginBottom: 12 },

  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#020617',
    marginBottom: 10,
  },
  correctBar: { backgroundColor: '#22c55e' },
  incorrectBar: { backgroundColor: '#ef4444' },

  performanceLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  correctText: { color: '#22c55e', fontSize: 12 },
  incorrectText: { color: '#ef4444', fontSize: 12 },

  primaryBtn: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: { color: '#fff', fontWeight: '700' },

  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryText: { color: '#94a3b8' },
});