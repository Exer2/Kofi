import React from 'react';
import { Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from '../screens/Feed';
import Leaderboard from '../screens/Leaderboard';
import MyProfile from '../screens/MyProfile';

const Tab = createBottomTabNavigator();

// Simple icon components
const CoffeeIcon = ({ color, size }) => (
  <Text style={{ fontSize: size, color }}>☕</Text>
);

const TrophyIcon = ({ color, size }) => (
  <Text style={{ fontSize: size, color }}>🏆</Text>
);

const PersonIcon = ({ color, size }) => (
  <Text style={{ fontSize: size, color }}>👤</Text>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="FeedTab"
      screenOptions={{
        tabBarActiveTintColor: '#d2691e',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          ...(Platform.OS === 'web' && {
            paddingBottom: 8,
            height: 60,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={Feed}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <CoffeeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="LeaderboardTab" 
        component={Leaderboard}
        options={{
          tabBarLabel: 'Lestvica',
          tabBarIcon: ({ color, size }) => <TrophyIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="MyProfileTab" 
        component={MyProfile}
        options={{
          tabBarLabel: 'Moj Profil',
          tabBarIcon: ({ color, size }) => <PersonIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

