import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import apiClient from '../api/client';

export default function NotesScreen() {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await apiClient.get('/notes');
            setNotes(response.data);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote) return;

        setAddingNote(true);
        try {
            const response = await apiClient.post('/notes', { content: newNote });
            setNotes([response.data, ...notes]);
            setNewNote('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add note');
        } finally {
            setAddingNote(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await apiClient.delete(`/notes/${id}`);
            setNotes(notes.filter((n: any) => n._id !== id));
        } catch (error) {
            Alert.alert('Error', 'Failed to delete note');
        }
    };

    const renderNoteItem = ({ item }: any) => (
        <View style={styles.noteCard}>
            <Text style={styles.noteContent}>{item.content}</Text>
            <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => handleDeleteNote(item._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Notes</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a new note..."
                    value={newNote}
                    onChangeText={setNewNote}
                    multiline
                />
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleAddNote}
                    disabled={addingNote || !newNote}
                >
                    {addingNote ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add</Text>}
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2D62ED" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={notes}
                    renderItem={renderNoteItem}
                    keyExtractor={(item: any) => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchNotes} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No notes yet. Start writing!</Text>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FE',
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 20,
        color: '#333',
    },
    inputContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        minHeight: 80,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        textAlignVertical: 'top',
    },
    addBtn: {
        backgroundColor: '#2D62ED',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    noteCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    noteContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
    },
    noteDate: {
        fontSize: 12,
        color: '#999',
    },
    deleteText: {
        fontSize: 12,
        color: '#FF5252',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
});
