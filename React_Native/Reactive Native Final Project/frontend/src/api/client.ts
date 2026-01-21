import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.51.13.88:5000/api';


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
            config.headers['x-auth-token'] = token;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
        if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.error(`API Error Response [${error.response.status}]:`, error.response.data);
            if (error.response.status === 401) {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Network Error (No Response):', {
                message: error.message,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    params: error.config?.params,
                }
            });
        } else {
            // Something happened in setting up the request
            console.error('API Request Setup Error:', error.message);
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
        category?: 'work' | 'personal' | 'health' | 'shopping' | 'other';
    }) => client.post('/tasks', data),

    update: (id: string, data: Partial<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        dueDate: string;
        isCompleted: boolean;
        category: 'work' | 'personal' | 'health' | 'shopping' | 'other';
    }>) => client.put(`/tasks/${id}`, data),

    delete: (id: string) => client.delete(`/tasks/${id}`),
};

// Notes API
export const notesAPI = {
    getAll: (taskId?: string) =>
        client.get('/notes', { params: taskId ? { taskId } : {} }),

    create: (data: { content: string; taskId?: string }) =>
        client.post('/notes', data),

    update: (id: string, data: { content?: string; taskId?: string }) =>
        client.put(`/notes/${id}`, data),

    delete: (id: string) => client.delete(`/notes/${id}`),
};

export default client;
