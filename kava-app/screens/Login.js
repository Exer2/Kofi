import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import supabase from '../backend/supabase';
import { authStyles } from '../Styles/authStyles';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle deep linking
    const handleDeepLink = (event) => {
      let url = event.url;
      if (url.includes('error=access_denied') || url.includes('error_code=otp_expired')) {
        Alert.alert(
          'Povezava je potekla',
          'Prosimo, poskusite se ponovno prijaviti ali zahtevajte novo potrditveno povezavo.',
          [{ text: 'V redu' }]
        );
      }
    };

    // Add event listener for deep linking
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Nekaj si pozabil/a izpolniti.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Email še ni potrjen. Prosimo, potrdite email naslov.');
          return;
        }
        setError('Napačen email ali geslo.');
        return;
      }
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Login error:', error);
      setError('Prišlo je do napake. Prosimo, poskusite ponovno.');
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
        <Text style={authStyles.title}>Prijava</Text>
        
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
        
        <TouchableOpacity style={authStyles.button} onPress={handleLogin}>
          <Text style={authStyles.buttonText}>Prijavi se</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={authStyles.linkContainer} onPress={() => navigation.navigate('Register')}>
          <Text style={authStyles.linkText}>Še nimaš računa? Registriraj se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}