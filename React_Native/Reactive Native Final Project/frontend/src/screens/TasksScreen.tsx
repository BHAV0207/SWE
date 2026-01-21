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
import { TaskCard, Button, LoadingSpinner } from '../components';
import { tasksAPI, notesAPI } from '../api/client';
import type { Task, Note } from '../components';

type FilterType = 'all' | 'pending' | 'completed';

export const TasksScreen: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'work' | 'personal' | 'health' | 'shopping' | 'other'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'shopping' | 'other'>('other');
    const [saving, setSaving] = useState(false);

    // Linked notes state
    const [taskNotes, setTaskNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.getAll();
            console.log('Fetched tasks from API:', response.data);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskNotes = async (taskId: string) => {
        try {
            const response = await notesAPI.getAll(taskId);
            setTaskNotes(response.data);
        } catch (error) {
            console.error('Failed to fetch task notes:', error);
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

    const filteredTasks = tasks.filter(task => {
        // Status filter
        const matchesStatus = filter === 'all' ||
            (filter === 'pending' && !task.isCompleted) ||
            (filter === 'completed' && task.isCompleted);

        // Category filter
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

        // Search filter
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesCategory && matchesSearch;
    });

    const handleToggleComplete = async (task: Task) => {
        try {
            await tasksAPI.update(task._id, { isCompleted: !task.isCompleted });
            setTasks(prev =>
                prev.map(t =>
                    t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
                )
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const handleDeleteTask = (task: Task) => {
        Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await tasksAPI.delete(task._id);
                            setTasks(prev => prev.filter(t => t._id !== task._id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    },
                },
            ]
        );
    };

    const openModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setCategory(task.category || 'other');
            fetchTaskNotes(task._id);
        } else {
            setEditingTask(null);
            setTitle('');
            setDescription('');
            setPriority('medium');
            setCategory('other');
            setTaskNotes([]);
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('other');
        setTaskNotes([]);
        setNewNoteContent('');
    };

    const handleSaveTask = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        setSaving(true);
        try {
            if (editingTask) {
                const response = await tasksAPI.update(editingTask._id, {
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    category,
                });
                setTasks(prev =>
                    prev.map(t => (t._id === editingTask._id ? response.data : t))
                );
            } else {
                const response = await tasksAPI.create({
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    category,
                });
                const newTask = response.data;

                // Create any pending notes for this new task
                if (taskNotes.length > 0) {
                    for (const note of taskNotes) {
                        if (note._id.startsWith('temp_')) {
                            await notesAPI.create({
                                content: note.content,
                                taskId: newTask._id,
                            });
                        }
                    }
                    newTask.noteCount = taskNotes.length;
                }

                setTasks(prev => [newTask, ...prev]);
            }
            closeModal();
        } catch (error) {
            console.error('Save task error:', error);
            Alert.alert('Error', 'Failed to save task');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNoteToTask = async () => {
        if (!newNoteContent.trim()) return;

        if (editingTask) {
            setAddingNote(true);
            try {
                const response = await notesAPI.create({
                    content: newNoteContent.trim(),
                    taskId: editingTask._id,
                });
                setTaskNotes(prev => [response.data, ...prev]);
                setNewNoteContent('');

                // Also update the note count for the task in the list
                setTasks(prev => prev.map(t =>
                    t._id === editingTask._id
                        ? { ...t, noteCount: (t.noteCount || 0) + 1 }
                        : t
                ));
            } catch (error) {
                Alert.alert('Error', 'Failed to add note');
            } finally {
                setAddingNote(false);
            }
        } else {
            // For new tasks, just add to local state with a temp ID
            const tempNote: Note = {
                _id: 'temp_' + Date.now(),
                content: newNoteContent.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                taskId: null
            } as any;
            setTaskNotes(prev => [tempNote, ...prev]);
            setNewNoteContent('');
        }
    };

    const renderFilterTab = (type: FilterType, label: string) => (
        <TouchableOpacity
            style={[styles.filterTab, filter === type && styles.filterTabActive]}
            onPress={() => setFilter(type)}
        >
            <Text
                style={[
                    styles.filterTabText,
                    filter === type && styles.filterTabTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderCategoryButton = (cat: 'work' | 'personal' | 'health' | 'shopping' | 'other', icon: string, label: string) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(cat)}
        >
            <Text style={styles.categoryButtonIcon}>{icon}</Text>
            <Text style={styles.categoryButtonText}>{label}</Text>
        </TouchableOpacity>
    );

    const renderPriorityButton = (p: 'low' | 'medium' | 'high', label: string) => (
        <TouchableOpacity
            style={[
                styles.priorityButton,
                priority === p && styles.priorityButtonActive,
                priority === p && {
                    backgroundColor:
                        p === 'high'
                            ? colors.dangerMuted
                            : p === 'medium'
                                ? colors.warningMuted
                                : colors.surfaceLight,
                },
            ]}
            onPress={() => setPriority(p)}
        >
            <Text
                style={[
                    styles.priorityButtonText,
                    priority === p && {
                        color:
                            p === 'high'
                                ? colors.danger
                                : p === 'medium'
                                    ? colors.warning
                                    : colors.textSecondary,
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Tasks</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tasks..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {renderFilterTab('all', 'All')}
                {renderFilterTab('pending', 'Pending')}
                {renderFilterTab('completed', 'Completed')}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilterScroll}
                contentContainerStyle={styles.categoryFilterContent}
            >
                {['all', 'work', 'personal', 'health', 'shopping', 'other'].map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryChip,
                            categoryFilter === cat && styles.categoryChipActive
                        ]}
                        onPress={() => setCategoryFilter(cat as any)}
                    >
                        <Text style={[
                            styles.categoryChipText,
                            categoryFilter === cat && styles.categoryChipTextActive
                        ]}>
                            {cat === 'all' ? '🏷️ All' :
                                cat === 'work' ? '💼 Work' :
                                    cat === 'personal' ? '👤 Personal' :
                                        cat === 'health' ? '🏥 Health' :
                                            cat === 'shopping' ? '🛒 Shop' : '🏷️ Other'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Task List */}
            <FlatList
                data={filteredTasks}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onPress={() => openModal(item)}
                        onToggleComplete={() => handleToggleComplete(item)}
                    />
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
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyText}>No tasks found</Text>
                        <Text style={styles.emptySubtext}>
                            Tap the + button to create a new task
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
                                {editingTask ? 'Edit Task' : 'New Task'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Title</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Task title"
                                placeholderTextColor={colors.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={styles.inputLabel}>Description (optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Add details..."
                                placeholderTextColor={colors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={styles.inputLabel}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                <View style={styles.categoryContainer}>
                                    {renderCategoryButton('work', '💼', 'Work')}
                                    {renderCategoryButton('personal', '👤', 'Personal')}
                                    {renderCategoryButton('health', '🏥', 'Health')}
                                    {renderCategoryButton('shopping', '🛒', 'Shop')}
                                    {renderCategoryButton('other', '🏷️', 'Other')}
                                </View>
                            </ScrollView>

                            <Text style={styles.inputLabel}>Priority</Text>
                            <View style={styles.priorityContainer}>
                                {renderPriorityButton('low', 'Low')}
                                {renderPriorityButton('medium', 'Medium')}
                                {renderPriorityButton('high', 'High')}
                            </View>

                            <View style={styles.notesSection}>
                                <Text style={styles.inputLabel}>Notes</Text>

                                <View style={styles.addNoteContainer}>
                                    <TextInput
                                        style={styles.addNoteInput}
                                        placeholder="Add a linked note..."
                                        placeholderTextColor={colors.textMuted}
                                        value={newNoteContent}
                                        onChangeText={setNewNoteContent}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={[styles.addNoteBtn, !newNoteContent.trim() && styles.addNoteBtnDisabled]}
                                        onPress={handleAddNoteToTask}
                                        disabled={addingNote || !newNoteContent.trim()}
                                    >
                                        <Text style={styles.addNoteBtnText}>
                                            {addingNote ? '...' : '+'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {taskNotes.length > 0 ? (
                                    <View style={styles.notesList}>
                                        {taskNotes.map(note => (
                                            <View key={note._id} style={styles.linkedNoteItem}>
                                                <Text style={styles.linkedNoteText}>{note.content}</Text>
                                                <Text style={styles.linkedNoteDate}>
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noNotesText}>No linked notes yet</Text>
                                )}
                            </View>

                            {editingTask && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        closeModal();
                                        handleDeleteTask(editingTask);
                                    }}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️ Delete Task</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title={editingTask ? 'Save Changes' : 'Create Task'}
                                onPress={handleSaveTask}
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
        paddingBottom: spacing.md,
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    filterTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceLight,
    },
    filterTabActive: {
        backgroundColor: colors.primaryMuted,
    },
    filterTabText: {
        ...typography.bodySecondary,
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: colors.primary,
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
    inputLabel: {
        ...typography.bodySecondary,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    textInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.text,
        fontSize: 16,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    priorityButtonActive: {
        borderColor: 'transparent',
    },
    priorityButtonText: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    deleteButton: {
        alignItems: 'center',
        padding: spacing.md,
        marginTop: spacing.md,
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
    // New styles for notes section
    notesSection: {
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
        paddingTop: spacing.lg,
    },
    addNoteContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    addNoteInput: {
        flex: 1,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.text,
        fontSize: 14,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        maxHeight: 100,
    },
    addNoteBtn: {
        width: 44,
        height: 44,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    addNoteBtnDisabled: {
        opacity: 0.5,
        backgroundColor: colors.surfaceLight,
    },
    addNoteBtnText: {
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    notesList: {
        gap: spacing.sm,
    },
    linkedNoteItem: {
        backgroundColor: colors.surfaceLight,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        marginBottom: spacing.xs,
    },
    linkedNoteText: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    linkedNoteDate: {
        ...typography.caption,
        color: colors.textMuted,
    },
    noNotesText: {
        ...typography.bodySecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    // Category styles
    categoryScroll: {
        marginBottom: spacing.md,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    categoryButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    categoryButtonActive: {
        backgroundColor: colors.primaryMuted,
        borderColor: colors.primary,
    },
    categoryButtonIcon: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    categoryButtonText: {
        ...typography.bodySecondary,
        fontWeight: '500',
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
    // Category Filter styles
    categoryFilterScroll: {
        marginBottom: spacing.md,
    },
    categoryFilterContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    categoryChipActive: {
        backgroundColor: colors.primaryMuted,
        borderColor: colors.primary,
    },
    categoryChipText: {
        ...typography.bodySecondary,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    categoryChipTextActive: {
        color: colors.primary,
    },
});
