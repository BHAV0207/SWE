import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { View, Text } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen'
import TaskDetailScreen from '../screens/TaskDetailScreen';
import NotesScreen from '../screens/NotesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2D62ED',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600'
                }
            }}
        >
            <Tab.Screen
                name="Tasks"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✓</Text>
                }}
            />
            <Tab.Screen
                name="Notes"
                component={NotesScreen}
                options={{
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✎</Text>
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
