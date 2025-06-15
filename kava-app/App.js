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

// Add web-specific meta tags and CSS - Več comprehensive kot prej
if (Platform.OS === 'web') {
  // Add viewport meta if not exists
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  }
  
  // Add comprehensive CSS to prevent zoom and improve touch experience
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    /* Prevent zoom on double tap */
    button, [role="button"], .touchable, input, textarea {
      touch-action: manipulation;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Prevent zoom on form inputs */
    input, textarea, select {
      font-size: 16px !important;
      transform-origin: left top;
      -webkit-appearance: none;
    }
    
    /* Body level zoom prevention */
    body {
      touch-action: manipulation;
      -webkit-text-size-adjust: 100%;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      overflow-x: hidden;
    }
    
    /* Prevent zoom on iOS Safari */
    @supports (-webkit-touch-callout: none) {
      input, textarea {
        font-size: 16px !important;
      }
    }
    
    /* Additional iOS Safari specific fixes */
    input:focus, textarea:focus {
      font-size: 16px !important;
      zoom: 1;
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    
    /* Disable selection on non-input elements */
    div, span, p, h1, h2, h3, h4, h5, h6, img {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
  
  // Add additional script to prevent zoom programmatically
  const script = document.createElement('script');
  script.textContent = `
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });
    
    document.addEventListener('gesturechange', function (e) {
      e.preventDefault();
    });
    
    document.addEventListener('gestureend', function (e) {
      e.preventDefault();
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  `;
  document.head.appendChild(script);
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
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{ 
            title: 'Prijava',
            headerBackTitleVisible: false 
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={{ 
            title: 'Registracija',
            headerBackTitleVisible: false 
          }}
        />
        <Stack.Screen 
          name="Feed" 
          component={Feed}
          options={{ 
            title: 'Kofi',
            headerLeft: null, // Remove back button
            gestureEnabled: false, // Disable swipe back gesture
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Your HomeScreen component
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kofi</Text>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
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
    ...(Platform.OS === 'web' && {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }),
  },
  arrowText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});


