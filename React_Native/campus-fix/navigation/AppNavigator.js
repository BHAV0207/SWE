import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import CreateIssueScreen from '../screens/CreateIssueScreen';
import MyIssuesScreen from '../screens/MyIssuesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center'
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={StudentHomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateIssue"
              component={CreateIssueScreen}
              options={{ title: 'Report Issue' }}
            />
            <Stack.Screen
              name="MyIssues"
              component={MyIssuesScreen}
              options={{ title: 'My Issues' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

