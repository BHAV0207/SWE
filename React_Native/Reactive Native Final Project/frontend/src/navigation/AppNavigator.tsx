import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, spacing, borderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components';
import {
    LoginScreen,
    RegisterScreen,
    DashboardScreen,
    TasksScreen,
    NotesScreen,
    ProfileScreen,
    ReportsScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom dark theme for navigation
const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.surfaceBorder,
        notification: colors.primary,
    },
};

// Tab bar icon component
const TabIcon: React.FC<{ name: string; focused: boolean; icon: string }> = ({
    name,
    focused,
    icon,
}) => (
    <View style={styles.tabIconContainer}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            {icon}
        </Text>
    </View>
);

// Auth Stack (Login/Register)
const AuthStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
        }}
    >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: styles.tabBarLabel,
        }}
    >
        <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon name="Dashboard" focused={focused} icon="🏠" />
                ),
            }}
        />
        <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon name="Tasks" focused={focused} icon="✓" />
                ),
            }}
        />
        <Tab.Screen
            name="Notes"
            component={NotesScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon name="Notes" focused={focused} icon="📝" />
                ),
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarIcon: ({ focused }) => (
                    <TabIcon name="Profile" focused={focused} icon="👤" />
                ),
            }}
        />
    </Tab.Navigator>
);

// Main App Navigator
export const AppNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="Reports" component={ReportsScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.surfaceBorder,
        borderTopWidth: 1,
        height: 65,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    tabIcon: {
        fontSize: 22,
        opacity: 0.6,
    },
    tabIconFocused: {
        opacity: 1,
    },
});
