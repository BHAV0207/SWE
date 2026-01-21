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
import { tasksAPI } from '../api/client';
import type { Task } from '../components';

type FilterType = 'all' | 'pending' | 'completed';

export const TasksScreen: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [saving, setSaving] = useState(false);

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

    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending') return !task.isCompleted;
        if (filter === 'completed') return task.isCompleted;
        return true;
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
        } else {
            setEditingTask(null);
            setTitle('');
            setDescription('');
            setPriority('medium');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
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
                });
                setTasks(prev =>
                    prev.map(t => (t._id === editingTask._id ? response.data : t))
                );
            } else {
                const response = await tasksAPI.create({
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                });
                setTasks(prev => [response.data, ...prev]);
            }
            closeModal();
        } catch (error) {
            Alert.alert('Error', 'Failed to save task');
        } finally {
            setSaving(false);
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

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {renderFilterTab('all', 'All')}
                {renderFilterTab('pending', 'Pending')}
                {renderFilterTab('completed', 'Completed')}
            </View>

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

                            <Text style={styles.inputLabel}>Priority</Text>
                            <View style={styles.priorityContainer}>
                                {renderPriorityButton('low', 'Low')}
                                {renderPriorityButton('medium', 'Medium')}
                                {renderPriorityButton('high', 'High')}
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
});
