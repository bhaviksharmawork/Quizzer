import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { username, logout } = useUser();

    const stats = [
        { label: 'Quizzes Played', value: '24', icon: '🎮' },
        { label: 'Correct Answers', value: '156', icon: '✅' },
        { label: 'Win Rate', value: '78%', icon: '🏆' },
        { label: 'Points Earned', value: '4.2K', icon: '⭐' },
    ];

    const achievements = [
        { id: '1', title: 'Quiz Master', desc: 'Win 10 quizzes', icon: '🎓', unlocked: true },
        { id: '2', title: 'Speed Demon', desc: 'Answer in under 3s', icon: '⚡', unlocked: true },
        { id: '3', title: 'Perfect Score', desc: 'Get 100% in a quiz', icon: '💯', unlocked: false },
        { id: '4', title: 'Social Star', desc: 'Play with 50 friends', icon: '🌟', unlocked: false },
    ];

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    // Get initials from username
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity>
                        <Text style={styles.settingsBtn}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarGradient}>
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarText}>{getInitials(username)}</Text>
                            </View>
                        </View>
                        <View style={styles.onlineIndicator} />
                    </View>

                    <Text style={styles.username}>{username || 'Guest'}</Text>
                    <Text style={styles.userTag}>@{(username || 'guest').toLowerCase().replace(/\s+/g, '')}</Text>

                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>🔥 Level 12 • Quiz Enthusiast</Text>
                    </View>

                    <View style={styles.xpBar}>
                        <View style={styles.xpFill} />
                    </View>
                    <Text style={styles.xpText}>2,450 / 3,000 XP to Level 13</Text>
                </View>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Achievements */}
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.achievementsContainer}>
                    {achievements.map((achievement) => (
                        <View
                            key={achievement.id}
                            style={[
                                styles.achievementCard,
                                !achievement.unlocked && styles.achievementLocked
                            ]}
                        >
                            <View style={[
                                styles.achievementIcon,
                                !achievement.unlocked && styles.achievementIconLocked
                            ]}>
                                <Text style={{ fontSize: 24, opacity: achievement.unlocked ? 1 : 0.4 }}>
                                    {achievement.icon}
                                </Text>
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[
                                    styles.achievementTitle,
                                    !achievement.unlocked && styles.textLocked
                                ]}>
                                    {achievement.title}
                                </Text>
                                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                            </View>
                            {achievement.unlocked && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editProfileBtn}>
                        <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>🚪 Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
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
        marginBottom: 24,
    },
    backBtn: { color: '#fff', fontSize: 22 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    settingsBtn: { fontSize: 20 },

    profileCard: {
        backgroundColor: '#0b1220',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        backgroundColor: '#3b82f6',
        borderWidth: 3,
        borderColor: '#8b5cf6',
    },
    avatarInner: {
        flex: 1,
        backgroundColor: '#071025',
        borderRadius: 47,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#22c55e',
        borderWidth: 3,
        borderColor: '#0b1220',
    },
    username: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    userTag: {
        color: '#64748b',
        fontSize: 14,
        marginBottom: 12,
    },
    levelBadge: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    levelText: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: '600',
    },
    xpBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#1e293b',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    xpFill: {
        width: '82%',
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
    },
    xpText: {
        color: '#64748b',
        fontSize: 11,
    },

    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '47%',
        backgroundColor: '#0b1220',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 12,
        textAlign: 'center',
    },

    achievementsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    achievementCard: {
        backgroundColor: '#0b1220',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    achievementLocked: {
        opacity: 0.6,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    achievementIconLocked: {
        backgroundColor: '#0f172a',
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    achievementDesc: {
        color: '#64748b',
        fontSize: 12,
    },
    textLocked: {
        color: '#94a3b8',
    },
    checkmark: {
        color: '#22c55e',
        fontSize: 18,
        fontWeight: '700',
    },

    actionButtons: {
        gap: 12,
    },
    editProfileBtn: {
        backgroundColor: '#1e3a5f',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    editProfileText: {
        color: '#60a5fa',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutBtn: {
        backgroundColor: '#1e1b2e',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dc2626',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '700',
    },
});
