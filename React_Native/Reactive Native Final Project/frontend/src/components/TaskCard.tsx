import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme/theme';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    isCompleted: boolean;
    createdAt: string;
    noteCount?: number;
    category?: 'work' | 'personal' | 'health' | 'shopping' | 'other';
}

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    onToggleComplete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onPress,
    onToggleComplete,
}) => {
    const getPriorityColor = () => {
        switch (task.priority) {
            case 'high':
                return colors.priorityHigh;
            case 'medium':
                return colors.priorityMedium;
            case 'low':
                return colors.priorityLow;
            default:
                return colors.textMuted;
        }
    };

    const getPriorityBackground = () => {
        switch (task.priority) {
            case 'high':
                return colors.dangerMuted;
            case 'medium':
                return colors.warningMuted;
            case 'low':
                return colors.surfaceLight;
            default:
                return colors.surfaceLight;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getCategoryIcon = () => {
        switch (task.category) {
            case 'work': return '💼';
            case 'personal': return '👤';
            case 'health': return '🏥';
            case 'shopping': return '🛒';
            default: return '🏷️';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, task.isCompleted && styles.completedCard]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <TouchableOpacity
                style={[
                    styles.checkbox,
                    task.isCompleted && styles.checkboxChecked,
                ]}
                onPress={onToggleComplete}
            >
                {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        task.isCompleted && styles.completedTitle,
                    ]}
                    numberOfLines={1}
                >
                    {task.title}
                </Text>
                {task.description && (
                    <Text style={styles.description} numberOfLines={1}>
                        {task.description}
                    </Text>
                )}
                <View style={styles.metaRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
                    <View
                        style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityBackground() },
                        ]}
                    >
                        <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
                            {task.priority.toUpperCase()}
                        </Text>
                    </View>
                    {task.noteCount !== undefined && task.noteCount > 0 && (
                        <View style={styles.noteBadge}>
                            <Text style={styles.noteCountText}>📝 {task.noteCount}</Text>
                        </View>
                    )}
                    {task.dueDate && (
                        <Text style={styles.dueDate}>📅 {formatDate(task.dueDate)}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    completedCard: {
        opacity: 0.7,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    checkmark: {
        color: colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    title: {
        ...typography.h3,
        marginBottom: spacing.xs,
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: colors.textMuted,
    },
    description: {
        ...typography.bodySecondary,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    priorityBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
    },
    dueDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    noteBadge: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    noteCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
    },
    categoryIcon: {
        fontSize: 14,
        marginRight: spacing.xs,
    },
});
