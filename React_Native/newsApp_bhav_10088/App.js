import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import CitySelectorScreen from './screens/CitySelectorScreen';
import NewsFeedScreen from './screens/NewsFeedScreen';
import NewsWebViewScreen from './screens/NewsWebViewScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import EmergencyAlertsScreen from './screens/EmergencyAlertsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="CitySelector"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="CitySelector" component={CitySelectorScreen} />
        <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
        <Stack.Screen name="NewsWebView" component={NewsWebViewScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        <Stack.Screen name="EmergencyAlerts" component={EmergencyAlertsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
