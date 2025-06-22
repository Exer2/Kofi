import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';
import Login from './screens/Login';
import Register from './screens/Register';
import Feed from './screens/Feed';
import { Ionicons } from '@expo/vector-icons';

// Add web-specific meta tags
if (Platform.OS === 'web') {
  // Add viewport meta if not exists
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  }
  
  // Add CSS to prevent zoom
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    
    button, [role="button"], .touchable {
      touch-action: manipulation;
    }
    
    body {
      touch-action: manipulation;
      -webkit-text-size-adjust: 100%;
    }
  `;
  document.head.appendChild(style);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

if (!__DEV__) {
  // Production-only code
  console.log = () => {}; // Disable console logs in production
  LogBox.ignoreAllLogs(); // Ignore warnings in production
}

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization code here
        // For example, check auth status, preload data, etc.
        
        // Artificial delay to show splash screen (can remove this in production)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (e) {
        console.warn(e);
        setError(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Show loading indicator if still preparing
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error screen if something went wrong
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
      </View>
    );
  }

  // Main app rendering
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Feed" component={Feed} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Your HomeScreen component remains the same
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kofi</Text>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.arrowText}>&gt;</Text>
      </TouchableOpacity>
    </View>
  );
}

// Your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -150,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 30, // Prostor med napisom in gumbom
  },
  circleButton: {
    backgroundColor: 'black',
    width: 60,
    height: 60,
    borderRadius: 30, // Polovica širine/višine za popoln krog
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow za Android
    shadowColor: '#000', // Shadow za iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  arrowText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});


