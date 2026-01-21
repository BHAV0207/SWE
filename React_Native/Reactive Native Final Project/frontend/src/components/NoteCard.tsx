import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme/theme';

export interface Note {
    _id: string;
    content: string;
    taskId?: string;
    createdAt: string;
}

interface NoteCardProps {
    note: Note;
    onPress: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPreview = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.content} numberOfLines={4}>
                {getPreview(note.content)}
            </Text>
            <View style={styles.footer}>
                <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
                {note.taskId && (
                    <View style={styles.linkedBadge}>
                        <Text style={styles.linkedText}>📎 Linked</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    content: {
        ...typography.body,
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    date: {
        ...typography.caption,
        color: colors.textMuted,
    },
    linkedBadge: {
        backgroundColor: colors.primaryMuted,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    linkedText: {
        ...typography.caption,
        color: colors.primary,
    },
});
