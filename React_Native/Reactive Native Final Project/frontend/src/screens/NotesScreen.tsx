import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import { NoteCard, Button, LoadingSpinner } from '../components';
import { notesAPI } from '../api/client';
import type { Note } from '../components';

export const NotesScreen: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Form state
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);

    const filteredNotes = notes.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof note.taskId === 'object' && note.taskId?.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const fetchNotes = async () => {
        try {
            const response = await notesAPI.getAll();
            setNotes(response.data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotes();
        setRefreshing(false);
    };

    const handleDeleteNote = (note: Note) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notesAPI.delete(note._id);
                            setNotes(prev => prev.filter(n => n._id !== note._id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete note');
                        }
                    },
                },
            ]
        );
    };

    const openModal = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setContent(note.content);
        } else {
            setEditingNote(null);
            setContent('');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingNote(null);
        setContent('');
    };

    const handleSaveNote = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Note content is required');
            return;
        }

        setSaving(true);
        try {
            if (editingNote) {
                const response = await notesAPI.update(editingNote._id, {
                    content: content.trim(),
                });
                setNotes(prev =>
                    prev.map(n => (n._id === editingNote._id ? response.data : n))
                );
            } else {
                const response = await notesAPI.create({
                    content: content.trim(),
                });
                setNotes(prev => [response.data, ...prev]);
            }
            closeModal();
        } catch (error) {
            Alert.alert('Error', 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Notes count */}
            <Text style={styles.countText}>{filteredNotes.length} notes</Text>

            {/* Notes List */}
            <FlatList
                data={filteredNotes}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <NoteCard note={item} onPress={() => openModal(item)} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📒</Text>
                        <Text style={styles.emptyText}>No notes yet</Text>
                        <Text style={styles.emptySubtext}>
                            Capture your thoughts and ideas
                        </Text>
                    </View>
                }
            />

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingNote ? 'Edit Note' : 'New Note'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Write your note..."
                                placeholderTextColor={colors.textMuted}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                autoFocus
                            />

                            {editingNote && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        closeModal();
                                        handleDeleteNote(editingNote);
                                    }}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️ Delete Note</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title={editingNote ? 'Save Changes' : 'Save Note'}
                                onPress={handleSaveNote}
                                loading={saving}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.sm,
    },
    title: {
        ...typography.h1,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 28,
        color: colors.text,
        fontWeight: '400',
        marginTop: -2,
    },
    countText: {
        ...typography.bodySecondary,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: spacing.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 64,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    modalTitle: {
        ...typography.h2,
    },
    closeButton: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    modalBody: {
        padding: spacing.lg,
    },
    noteInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.text,
        fontSize: 16,
        minHeight: 200,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    deleteButton: {
        alignItems: 'center',
        padding: spacing.md,
        marginTop: spacing.lg,
    },
    deleteButtonText: {
        color: colors.danger,
        fontSize: 16,
    },
    modalFooter: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
    },
    // Search styles
    searchContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    searchInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
});
