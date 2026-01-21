import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your actual backend URL
// For physical device testing, use your computer's local IP (currently 10.51.13.88)
// For Android emulator, use 10.0.2.2
// For iOS simulator, use localhost
const BASE_URL = 'http://10.51.13.88:5000/api';
// const BASE_URL = 'http://10.0.2.2:5000/api'; 
// const BASE_URL = 'http://localhost:5000/api'; 

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
client.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        client.post('/auth/login', { email, password }),

    register: (name: string, email: string, password: string) =>
        client.post('/auth/register', { name, email, password }),
};

// Tasks API
export const tasksAPI = {
    getAll: () => client.get('/tasks'),

    create: (data: {
        title: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        dueDate?: string;
    }) => client.post('/tasks', data),

    update: (id: string, data: Partial<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        dueDate: string;
        isCompleted: boolean;
    }>) => client.put(`/tasks/${id}`, data),

    delete: (id: string) => client.delete(`/tasks/${id}`),
};

// Notes API
export const notesAPI = {
    getAll: () => client.get('/notes'),

    create: (data: { content: string; taskId?: string }) =>
        client.post('/notes', data),

    update: (id: string, data: { content?: string; taskId?: string }) =>
        client.put(`/notes/${id}`, data),

    delete: (id: string) => client.delete(`/notes/${id}`),
};

export default client;
