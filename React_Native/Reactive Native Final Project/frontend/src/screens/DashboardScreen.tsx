import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';
import { Card, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/client';
import type { Task } from '../components';

export const DashboardScreen: React.FC = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.getAll();
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.isCompleted).length,
        pending: tasks.filter(t => !t.isCompleted).length,
        highPriority: tasks.filter(t => t.priority === 'high' && !t.isCompleted).length,
    };

    const topPriorityTasks = tasks
        .filter(t => t.priority === 'high' && !t.isCompleted)
        .slice(0, 3);

    const weeklyData = [
        { day: 'Mon', count: 4 },
        { day: 'Tue', count: 7 },
        { day: 'Wed', count: 5 },
        { day: 'Thu', count: 8 },
        { day: 'Fri', count: 6 },
        { day: 'Sat', count: 3 },
        { day: 'Sun', count: 2 },
    ];

    const maxWeekly = Math.max(...weeklyData.map(d => d.count));

    const completionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
                </View>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Tasks', { action: 'create' })}
                >
                    <Text style={styles.actionIcon}>➕</Text>
                    <Text style={styles.actionLabel}>New Task</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Notes', { action: 'create' })}
                >
                    <Text style={styles.actionIcon}>📝</Text>
                    <Text style={styles.actionLabel}>Add Note</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Reports')}
                >
                    <Text style={styles.actionIcon}>📊</Text>
                    <Text style={styles.actionLabel}>Report</Text>
                </TouchableOpacity>
            </View>

            {/* Productivity Score */}
            <Card style={styles.scoreCard} variant="elevated">
                <View style={styles.scoreHeader}>
                    <Text style={styles.scoreTitle}>Productivity Score</Text>
                    <Text style={styles.scoreEmoji}>🎯</Text>
                </View>
                <View style={styles.scoreContent}>
                    <Text style={styles.scoreValue}>{completionRate}%</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${completionRate}%` }
                            ]}
                        />
                    </View>
                </View>
                <Text style={styles.scoreSubtext}>
                    {stats.completed} of {stats.total} tasks completed
                </Text>
            </Card>

            {/* Weekly Progress */}
            <Card style={styles.chartCard}>
                <Text style={styles.sectionTitle}>Weekly Activity</Text>
                <View style={styles.chartContainer}>
                    {weeklyData.map((data, index) => (
                        <View key={index} style={styles.chartBarContainer}>
                            <View
                                style={[
                                    styles.chartBar,
                                    { height: (data.count / maxWeekly) * 80 }
                                ]}
                            />
                            <Text style={styles.chartDay}>{data.day}</Text>
                        </View>
                    ))}
                </View>
            </Card>

            {/* Top Priority Section */}
            {topPriorityTasks.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.danger }]}>Top Priority</Text>
                        <Text style={styles.sectionBadge}>Now</Text>
                    </View>
                    {topPriorityTasks.map((task) => (
                        <Card key={task._id} style={{ ...styles.recentTask, ...styles.topPriorityTask }}>
                            <View style={styles.recentTaskContent}>
                                <View style={[styles.taskStatus, { backgroundColor: colors.dangerMuted }]}>
                                    <Text style={[styles.taskStatusIcon, { color: colors.danger }]}>🔥</Text>
                                </View>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                    <Text style={styles.taskMeta}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <Text style={styles.statIcon}>📋</Text>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total Tasks</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Text style={styles.statIcon}>⏳</Text>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                        {stats.pending}
                    </Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Text style={styles.statIcon}>✅</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                        {stats.completed}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={[styles.statValue, { color: colors.danger }]}>
                        {stats.highPriority}
                    </Text>
                    <Text style={styles.statLabel}>High Priority</Text>
                </Card>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Tasks</Text>
                {tasks.slice(0, 3).map((task) => (
                    <Card key={task._id} style={styles.recentTask}>
                        <View style={styles.recentTaskContent}>
                            <View style={[
                                styles.taskStatus,
                                { backgroundColor: task.isCompleted ? colors.successMuted : colors.warningMuted }
                            ]}>
                                <Text style={styles.taskStatusIcon}>
                                    {task.isCompleted ? '✓' : '○'}
                                </Text>
                            </View>
                            <View style={styles.taskInfo}>
                                <Text
                                    style={[
                                        styles.taskTitle,
                                        task.isCompleted && styles.completedTask
                                    ]}
                                    numberOfLines={1}
                                >
                                    {task.title}
                                </Text>
                                <Text style={styles.taskMeta}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </Text>
                            </View>
                        </View>
                    </Card>
                ))}
                {tasks.length === 0 && (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyText}>No tasks yet</Text>
                        <Text style={styles.emptySubtext}>
                            Create your first task to get started!
                        </Text>
                    </Card>
                )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        ...typography.bodySecondary,
        marginBottom: spacing.xs,
    },
    userName: {
        ...typography.h2,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    scoreCard: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    scoreTitle: {
        ...typography.h3,
    },
    scoreEmoji: {
        fontSize: 24,
    },
    scoreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.primary,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    scoreSubtext: {
        ...typography.caption,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '48%',
        alignItems: 'center',
        padding: spacing.md,
    },
    statIcon: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    recentTask: {
        marginBottom: spacing.sm,
    },
    recentTaskContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskStatus: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    taskStatusIcon: {
        fontSize: 14,
        color: colors.text,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        ...typography.body,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    completedTask: {
        textDecorationLine: 'line-through',
        color: colors.textMuted,
    },
    taskMeta: {
        ...typography.caption,
    },
    emptyCard: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        ...typography.bodySecondary,
        textAlign: 'center',
    },
    // Enhancement styles
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.card,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    actionLabel: {
        ...typography.caption,
        fontWeight: '600',
    },
    chartCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        paddingTop: spacing.md,
    },
    chartBarContainer: {
        alignItems: 'center',
        flex: 1,
    },
    chartBar: {
        width: 12,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xs,
    },
    chartDay: {
        ...typography.caption,
        fontSize: 10,
        color: colors.textMuted,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionBadge: {
        ...typography.caption,
        backgroundColor: colors.danger,
        color: colors.text,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        fontWeight: '700',
    },
    topPriorityTask: {
        borderLeftWidth: 4,
        borderLeftColor: colors.danger,
    },
});
