import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';

export default function TaskDetailScreen({ route, navigation }: any) {
    const { task } = route.params || {};
    const isEditing = !!task;

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [loading, setLoading] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [linkedNotes, setLinkedNotes] = useState<any[]>([]);

    useEffect(() => {
        if (isEditing) {
            fetchLinkedNotes();
        }
    }, []);

    const fetchLinkedNotes = async () => {
        try {
            const response = await apiClient.get('/notes');
            const filtered = response.data.filter((n: any) => n.taskId === task._id);
            setLinkedNotes(filtered);
        } catch (error) {
            console.error('Failed to fetch linked notes', error);
        }
    };

    const handleAddNote = async () => {
        if (!noteText) return;
        try {
            const response = await apiClient.post('/notes', {
                content: noteText,
                taskId: task._id
            });
            setLinkedNotes([response.data, ...linkedNotes]);
            setNoteText('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add note');
        }
    };

    const handleSave = async () => {
        if (!title) {
            Alert.alert('Error', 'Title is required');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await apiClient.put(`/tasks/${task._id}`, { title, description, priority });
            } else {
                await apiClient.post('/tasks', { title, description, priority });
            }
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save task', error);
            Alert.alert('Error', 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/tasks/${task._id}`);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="What needs to be done?"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add some details..."
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={4}
                />

                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                    {['low', 'medium', 'high'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.priorityBtn,
                                priority === p ? styles.priorityBtnSelected : {},
                                priority === p ? { backgroundColor: getPriorityColor(p) } : {}
                            ]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[styles.priorityBtnText, priority === p ? styles.textWhite : {}]}>
                                {p}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {isEditing && (
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: task?.isCompleted === true ? '#FFB300' : '#4CAF50', marginTop: 20 }]}
                        onPress={async () => {
                            try {
                                await apiClient.put(`/tasks/${task._id}`, { isCompleted: !task.isCompleted });
                                navigation.goBack();
                            } catch (error) {
                                Alert.alert('Error', 'Failed to update task');
                            }
                        }}
                    >
                        <Text style={styles.saveBtnText}>{task?.isCompleted ? 'Mark Pending' : 'Mark Completed'}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Task</Text>}
                </TouchableOpacity>

                {isEditing && (
                    <>
                        <Text style={styles.label}>Linked Notes</Text>
                        {linkedNotes.map((n: any) => (
                            <View key={n._id} style={styles.noteItem}>
                                <Text style={styles.noteItemText}>{n.content}</Text>
                            </View>
                        ))}
                        <TextInput
                            style={[styles.input, { minHeight: 60, marginBottom: 10 }]}
                            placeholder="Add a note to this task..."
                            value={noteText}
                            onChangeText={setNoteText}
                        />
                        <TouchableOpacity
                            style={[styles.saveBtn, { marginTop: 0, height: 45, backgroundColor: '#4CAF50' }]}
                            onPress={handleAddNote}
                        >
                            <Text style={[styles.saveBtnText, { fontSize: 14 }]}>Add Note</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Text style={styles.deleteBtnText}>Delete Task</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const getPriorityColor = (p: string) => {
    switch (p) {
        case 'high': return '#FF5252';
        case 'medium': return '#FFB300';
        default: return '#4CAF50';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    backBtn: {
        color: '#2D62ED',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    priorityBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    priorityBtnSelected: {
        // Background color set dynamically
    },
    priorityBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'capitalize',
    },
    textWhite: {
        color: '#fff',
    },
    saveBtn: {
        backgroundColor: '#2D62ED',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteBtn: {
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    deleteBtnText: {
        color: '#FF5252',
        fontSize: 16,
        fontWeight: '600',
    },
    noteItem: {
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    noteItemText: {
        fontSize: 14,
        color: '#444',
    },
});
