import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity  } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login'; 
import { useNavigation } from '@react-navigation/native';
import Register from './screens/Register';
import api from './services/api'; 
import Feed from './screens/Feed';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kafica is a go</Text>
      <TouchableOpacity 
        style={styles.circleButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="Register" component={Register}/>
        <Stack.Screen name="Feed" component={Feed} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


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
  }
});


