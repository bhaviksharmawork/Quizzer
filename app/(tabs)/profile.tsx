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
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { username, logout } = useUser();
    const { isDarkMode, colors } = useTheme();

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

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Dynamic styles based on theme
    const dynamicStyles = {
        safe: { flex: 1, backgroundColor: colors.background },
        backBtn: { ...styles.backBtn, color: colors.primaryText },
        headerTitle: { ...styles.headerTitle, color: colors.primaryText },
        profileCard: { ...styles.profileCard, backgroundColor: colors.cardBg, borderColor: colors.border },
        avatarInner: { ...styles.avatarInner, backgroundColor: colors.background },
        avatarText: { ...styles.avatarText, color: colors.primaryText },
        onlineIndicator: { ...styles.onlineIndicator, borderColor: colors.cardBg },
        username: { ...styles.username, color: colors.primaryText },
        userTag: { ...styles.userTag, color: colors.secondaryText },
        levelBadge: { ...styles.levelBadge, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' },
        xpBar: { ...styles.xpBar, backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' },
        xpText: { ...styles.xpText, color: colors.secondaryText },
        sectionTitle: { ...styles.sectionTitle, color: colors.primaryText },
        statCard: { ...styles.statCard, backgroundColor: colors.cardBg, borderColor: colors.border },
        statValue: { ...styles.statValue, color: colors.primaryText },
        statLabel: { ...styles.statLabel, color: colors.secondaryText },
        achievementCard: { ...styles.achievementCard, backgroundColor: colors.cardBg, borderColor: colors.border },
        achievementIcon: { ...styles.achievementIcon, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' },
        achievementIconLocked: { ...styles.achievementIconLocked, backgroundColor: isDarkMode ? '#0f172a' : '#e2e8f0' },
        achievementTitle: { ...styles.achievementTitle, color: colors.primaryText },
        achievementDesc: { ...styles.achievementDesc, color: colors.secondaryText },
        textLocked: { color: colors.secondaryText },
        editProfileBtn: { ...styles.editProfileBtn, backgroundColor: isDarkMode ? '#1e3a5f' : '#dbeafe' },
        logoutBtn: { ...styles.logoutBtn, backgroundColor: isDarkMode ? '#1e1b2e' : '#fef2f2' },
    };

    return (
        <SafeAreaView style={dynamicStyles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={dynamicStyles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={dynamicStyles.headerTitle}>Profile</Text>
                    <TouchableOpacity>
                        <Text style={styles.settingsBtn}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={dynamicStyles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarGradient}>
                            <View style={dynamicStyles.avatarInner}>
                                <Text style={dynamicStyles.avatarText}>{getInitials(username)}</Text>
                            </View>
                        </View>
                        <View style={dynamicStyles.onlineIndicator} />
                    </View>

                    <Text style={dynamicStyles.username}>{username || 'Guest'}</Text>
                    <Text style={dynamicStyles.userTag}>@{(username || 'guest').toLowerCase().replace(/\s+/g, '')}</Text>

                    <View style={dynamicStyles.levelBadge}>
                        <Text style={styles.levelText}>🔥 Level 12 • Quiz Enthusiast</Text>
                    </View>

                    <View style={dynamicStyles.xpBar}>
                        <View style={styles.xpFill} />
                    </View>
                    <Text style={dynamicStyles.xpText}>2,450 / 3,000 XP to Level 13</Text>
                </View>

                {/* Stats Grid */}
                <Text style={dynamicStyles.sectionTitle}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={dynamicStyles.statCard}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={dynamicStyles.statValue}>{stat.value}</Text>
                            <Text style={dynamicStyles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Achievements */}
                <Text style={dynamicStyles.sectionTitle}>Achievements</Text>
                <View style={styles.achievementsContainer}>
                    {achievements.map((achievement) => (
                        <View
                            key={achievement.id}
                            style={[
                                dynamicStyles.achievementCard,
                                !achievement.unlocked && styles.achievementLocked
                            ]}
                        >
                            <View style={[
                                dynamicStyles.achievementIcon,
                                !achievement.unlocked && dynamicStyles.achievementIconLocked
                            ]}>
                                <Text style={{ fontSize: 24, opacity: achievement.unlocked ? 1 : 0.4 }}>
                                    {achievement.icon}
                                </Text>
                            </View>
                            <View style={styles.achievementInfo}>
                                <Text style={[
                                    dynamicStyles.achievementTitle,
                                    !achievement.unlocked && dynamicStyles.textLocked
                                ]}>
                                    {achievement.title}
                                </Text>
                                <Text style={dynamicStyles.achievementDesc}>{achievement.desc}</Text>
                            </View>
                            {achievement.unlocked && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={dynamicStyles.editProfileBtn}>
                        <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={dynamicStyles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>🚪 Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
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
        marginBottom: 24,
    },
    backBtn: { fontSize: 22 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    settingsBtn: { fontSize: 20 },

    profileCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
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
        borderRadius: 47,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
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
    },
    username: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    userTag: {
        fontSize: 14,
        marginBottom: 12,
    },
    levelBadge: {
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
        fontSize: 11,
    },

    sectionTitle: {
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
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },

    achievementsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    achievementCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    achievementLocked: {
        opacity: 0.6,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    achievementIconLocked: {},
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    achievementDesc: {
        fontSize: 12,
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
