import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function LiveQuizResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDarkMode, colors } = useTheme();
    const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        try {
            const answersData = JSON.parse(params.answers as string || '[]');
            const questionsData = JSON.parse(params.questions as string || '[]');
            const totalQuestions = parseInt(params.totalQuestions as string || '0');

            let correctCount = 0;
            let totalTimeTaken = 0;

            answersData.forEach((answer: any) => {
                const question = questionsData.find((q: any) => q.id === answer.questionId);
                if (question && answer.selectedAnswer === question.correctAnswer) {
                    correctCount++;
                }
                totalTimeTaken += answer.timeTaken || 0;
            });

            const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

            setScore({
                correct: correctCount,
                total: totalQuestions,
                percentage: percentage
            });

            setTotalTime(totalTimeTaken);
        } catch (error) {
            console.error('Error parsing quiz data:', error);
            setScore({ correct: 0, total: 0, percentage: 0 });
        }
    }, [params.answers, params.questions, params.totalQuestions]);

    // Dynamic styles based on theme
    const dynamicStyles = {
        safe: { flex: 1, backgroundColor: colors.background },
        trophyCircle: { ...styles.trophyCircle, backgroundColor: colors.cardBg },
        title: { ...styles.title, color: colors.primaryText },
        subtitle: { ...styles.subtitle, color: colors.secondaryText },
        rankCard: { ...styles.rankCard, backgroundColor: colors.cardBg },
        rankLabel: { ...styles.rankLabel, color: colors.secondaryText },
        rankValue: { ...styles.rankValue, color: colors.primaryText },
        rankMeta: { ...styles.rankMeta, color: colors.secondaryText },
        statCard: { ...styles.statCard, backgroundColor: colors.cardBg },
        statLabel: { ...styles.statLabel, color: colors.secondaryText },
        statValue: { ...styles.statValue, color: colors.primaryText },
        performanceCard: { ...styles.performanceCard, backgroundColor: colors.cardBg },
        performanceTitle: { ...styles.performanceTitle, color: colors.secondaryText },
        performanceSub: { ...styles.performanceSub, color: colors.primaryText },
        progressBar: { ...styles.progressBar, backgroundColor: isDarkMode ? '#020617' : '#e2e8f0' },
        secondaryBtn: { ...styles.secondaryBtn, borderColor: colors.border },
        secondaryText: { ...styles.secondaryText, color: colors.secondaryText },
    };

    return (
        <SafeAreaView style={dynamicStyles.safe}>
            <View style={styles.container}>
                {/* Trophy */}
                <View style={styles.trophyWrapper}>
                    <View style={dynamicStyles.trophyCircle}>
                        <Text style={styles.trophy}>🏆</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={dynamicStyles.title}>Well Done!</Text>
                <Text style={dynamicStyles.subtitle}>You completed the quiz successfully.</Text>

                {/* Rank Card */}
                <View style={dynamicStyles.rankCard}>
                    <Text style={dynamicStyles.rankLabel}>YOUR RANK</Text>
                    <Text style={dynamicStyles.rankValue}>
                        {score.percentage >= 80 ? '1st Place' :
                            score.percentage >= 60 ? '2nd Place' :
                                score.percentage >= 40 ? '3rd Place' :
                                    score.percentage >= 20 ? '4th Place' : '5th Place'}
                    </Text>
                    <Text style={dynamicStyles.rankMeta}>👥 {Math.floor(Math.random() * 200) + 50} others played</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={dynamicStyles.statCard}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <Text style={dynamicStyles.statLabel}>Total Score</Text>
                        <Text style={dynamicStyles.statValue}>{score.correct * 100} pts</Text>
                    </View>

                    <View style={dynamicStyles.statCard}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={dynamicStyles.statLabel}>Accuracy</Text>
                        <Text style={dynamicStyles.statValue}>{score.percentage}%</Text>
                    </View>
                </View>

                {/* Performance */}
                <View style={dynamicStyles.performanceCard}>
                    <Text style={dynamicStyles.performanceTitle}>PERFORMANCE BREAKDOWN</Text>
                    <Text style={dynamicStyles.performanceSub}>{score.total} Questions</Text>

                    <View style={dynamicStyles.progressBar}>
                        <View style={[styles.correctBar, { width: `${score.percentage}%` }]} />
                        <View style={[styles.incorrectBar, { width: `${100 - score.percentage}%` }]} />
                    </View>

                    <View style={styles.performanceLegend}>
                        <Text style={styles.correctText}>● CORRECT {score.correct}</Text>
                        <Text style={styles.incorrectText}>● INCORRECT {score.total - score.correct}</Text>
                    </View>
                </View>

                {/* Actions */}
                <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/')}>
                    <Text style={styles.primaryText}>🏠 Back to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={dynamicStyles.secondaryBtn}>
                    <Text style={dynamicStyles.secondaryText}>🔗 Share Result</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center' },

    trophyWrapper: { marginTop: 20, marginBottom: 20 },
    trophyCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trophy: { fontSize: 32 },

    title: { fontSize: 26, fontWeight: '800' },
    subtitle: { marginTop: 6, marginBottom: 20 },

    rankCard: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    rankLabel: { fontSize: 12, marginBottom: 6 },
    rankValue: { fontSize: 28, fontWeight: '800' },
    rankMeta: { marginTop: 6 },

    statsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
    statCard: {
        flex: 1,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    statIcon: { fontSize: 18, marginBottom: 6 },
    statLabel: { fontSize: 12 },
    statValue: { fontSize: 18, fontWeight: '700', marginTop: 6 },

    performanceCard: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    performanceTitle: { fontSize: 12, marginBottom: 6 },
    performanceSub: { fontWeight: '700', marginBottom: 12 },

    progressBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
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
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryText: {},
});
