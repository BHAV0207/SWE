import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import { Card, Button } from '../components';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {getInitials(user?.name || 'User')}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            {/* Info Cards */}
            <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>👤</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{user?.name}</Text>
                    </View>
                </View>
            </Card>

            <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📧</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email Address</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>
            </Card>

            {/* App Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Card style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📱</Text>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>App Version</Text>
                            <Text style={styles.infoValue}>1.0.0</Text>
                        </View>
                    </View>
                </Card>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
                <Button
                    title="Logout"
                    variant="danger"
                    onPress={handleLogout}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Smart Productivity App
                </Text>
                <Text style={styles.footerSubtext}>
                    Built with ❤️ for productivity lovers
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingVertical: spacing.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.text,
    },
    userName: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    userEmail: {
        ...typography.bodySecondary,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    infoCard: {
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        ...typography.caption,
        marginBottom: spacing.xs,
    },
    infoValue: {
        ...typography.body,
    },
    logoutSection: {
        marginTop: spacing.xxl,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xxl,
        paddingTop: spacing.lg,
    },
    footerText: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    footerSubtext: {
        ...typography.caption,
    },
});
