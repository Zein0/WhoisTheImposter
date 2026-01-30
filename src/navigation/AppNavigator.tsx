import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';
import {
  HomeScreen,
  CreateLobbyScreen,
  LocalGameScreen,
  OnlineGameScreen,
  JoinLobbyScreen,
  ResultsScreen,
  CategoriesScreen,
  SettingsScreen,
  SubscriptionScreen,
} from '../screens';

const Stack = createNativeStackNavigator<NavigationParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateLobby" component={CreateLobbyScreen} />
        <Stack.Screen
          name="LocalGame"
          component={LocalGameScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="OnlineGame"
          component={OnlineGameScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="JoinLobby" component={JoinLobbyScreen} />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
