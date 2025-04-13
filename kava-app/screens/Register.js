import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import supabase from '../backend/supabase';
import { authStyles } from '../Styles/authStyles';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError('Prosim izpolni vsa polja.');
      return;
    }
    try {
      // Step 1: Register the user with email and password
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      console.log('Signup response:', signupData);

      // Step 2: Store the username in the "profiles" table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: signupData.user.id, username }]);

      if (profileError) {
        setError(profileError.message);
        return;
      }
      Alert.alert('Registracija uspešna!', 
        'Sedaj se lahko prijaviš.');
      navigation.navigate('Login'); // Navigate to the Login screen
    } catch (error) {
      console.error('Registration error:', error);
      setError('Nekaj je šlo narobe. Poskusi ponovno.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[
        authStyles.container,
        Platform.select(authStyles.containerWithPlatform)
      ]}>
        <Text style={authStyles.title}>Registracija</Text>
        
        <TextInput
          style={authStyles.input}
          placeholder="Vzdevek"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={authStyles.input}
          placeholder="E-naslov"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={authStyles.input}
          placeholder="Geslo"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        {error && <Text style={authStyles.error}>{error}</Text>}
        
        <TouchableOpacity style={authStyles.button} onPress={handleRegister}>
          <Text style={authStyles.buttonText}>Ustvari račun</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={authStyles.linkContainer} onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.linkText}>Že imaš račun? Prijavi se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}