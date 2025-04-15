import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';
import Login from './screens/Login';
import Register from './screens/Register';
import Feed from './screens/Feed';
import { Ionicons } from '@expo/vector-icons';
import { appStyles } from './Styles/styles';

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
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
        setError(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Show loading indicator if still preparing
  if (!isReady) {
    return (
      <View style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error screen if something went wrong
  if (error) {
    return (
      <View style={appStyles.errorContainer}>
        <Text style={appStyles.errorText}>Error: {error.message}</Text>
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

function HomeScreen({ navigation }) {
  const backgroundImage = require('./assets/ozadjeKofi.png');
  
  return (
    <ImageBackground 
      source={backgroundImage} 
      style={appStyles.backgroundImage}
      resizeMode="cover"
    >
      <View style={appStyles.container}>
        <Text style={appStyles.title}>Kofi</Text>
        <TouchableOpacity
          style={appStyles.circleButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-forward" size={30} color="white" /> 
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}


