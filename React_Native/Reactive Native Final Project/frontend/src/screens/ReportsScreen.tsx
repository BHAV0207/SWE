import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import { Card, LoadingSpinner } from '../components';
import { tasksAPI, notesAPI } from '../api/client';

export const ReportsScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalNotes: 0,
        completionRate: 0,
        priorityBreakdown: { low: 0, medium: 0, high: 0 },
        categoryBreakdown: { work: 0, personal: 0, health: 0, shopping: 0, other: 0 }
    });

    const fetchStats = async () => {
        try {
            const [tasksRes, notesRes] = await Promise.all([
                tasksAPI.getAll(),
                notesAPI.getAll()
            ]);

            const tasks = tasksRes.data;
            const completed = tasks.filter((t: any) => t.isCompleted).length;

            const priorityBreakdown = tasks.reduce((acc: any, t: any) => {
                acc[t.priority] = (acc[t.priority] || 0) + 1;
                return acc;
            }, { low: 0, medium: 0, high: 0 });

            const categoryBreakdown = tasks.reduce((acc: any, t: any) => {
                acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
            }, { work: 0, personal: 0, health: 0, shopping: 0, other: 0 });

            setStats({
                totalTasks: tasks.length,
                completedTasks: completed,
                pendingTasks: tasks.length - completed,
                totalNotes: notesRes.data.length,
                completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
                priorityBreakdown,
                categoryBreakdown
            });
        } catch (error) {
            console.error('Failed to fetch report stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <Text style={styles.title}>Analytics Report</Text>

            <View style={styles.grid}>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalTasks}</Text>
                    <Text style={styles.statLabel}>Total Tasks</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalNotes}</Text>
                    <Text style={styles.statLabel}>Total Notes</Text>
                </Card>
            </View>

            <Card style={styles.mainCard}>
                <Text style={styles.cardTitle}>Completion Rate</Text>
                <Text style={styles.bigValue}>{stats.completionRate}%</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
                </View>
                <Text style={styles.subtext}>{stats.completedTasks} completed out of {stats.totalTasks} tasks</Text>
            </Card>

            <Text style={styles.sectionTitle}>Priority Breakdown</Text>
            <View style={styles.breakdownContainer}>
                {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                    <View key={priority} style={styles.breakdownItem}>
                        <View style={styles.breakdownHeader}>
                            <Text style={styles.breakdownLabel}>{priority.toUpperCase()}</Text>
                            <Text style={styles.breakdownValue}>{count}</Text>
                        </View>
                        <View style={styles.miniBar}>
                            <View
                                style={[
                                    styles.miniFill,
                                    {
                                        width: stats.totalTasks > 0 ? `${(count / stats.totalTasks) * 100}%` : '0%',
                                        backgroundColor: priority === 'high' ? colors.danger : priority === 'medium' ? colors.warning : colors.primary
                                    }
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <Card style={styles.categoryCard}>
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                    <View key={cat} style={styles.catItem}>
                        <Text style={styles.catIcon}>
                            {cat === 'work' ? '💼' : cat === 'personal' ? '👤' : cat === 'health' ? '🏥' : cat === 'shopping' ? '🛒' : '🏷️'}
                        </Text>
                        <Text style={styles.catLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                        <Text style={styles.catCount}>{count}</Text>
                    </View>
                ))}
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    title: { ...typography.h1, marginBottom: spacing.xl },
    grid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
    statValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
    statLabel: { ...typography.caption, marginTop: 4 },
    mainCard: { padding: spacing.lg, marginBottom: spacing.xl },
    cardTitle: { ...typography.h3, marginBottom: spacing.md },
    bigValue: { fontSize: 48, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm },
    progressBar: { height: 10, backgroundColor: colors.surfaceLight, borderRadius: 5, overflow: 'hidden', marginBottom: spacing.sm },
    progressFill: { height: '100%', backgroundColor: colors.primary },
    subtext: { ...typography.caption, color: colors.textMuted },
    sectionTitle: { ...typography.h3, marginBottom: spacing.md, marginTop: spacing.md },
    breakdownContainer: { gap: spacing.md, marginBottom: spacing.xl },
    breakdownItem: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md },
    breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    breakdownLabel: { ...typography.caption, fontWeight: '700' },
    breakdownValue: { ...typography.body, fontWeight: '700' },
    miniBar: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, overflow: 'hidden' },
    miniFill: { height: '100%' },
    categoryCard: { padding: spacing.md },
    catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
    catIcon: { fontSize: 18, marginRight: spacing.md },
    catLabel: { flex: 1, ...typography.body },
    catCount: { fontWeight: '700', color: colors.primary },
});
