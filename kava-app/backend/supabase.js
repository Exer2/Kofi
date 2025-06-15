import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';

// Web kompatibilen način branja environment variables
let REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY;

if (Platform.OS === 'web') {
  // Web uporablja process.env
  REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  REACT_APP_SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
} else {
  // Mobilne platforme uporabljajo @env
  try {
    const envVars = require('@env');
    REACT_APP_SUPABASE_URL = envVars.REACT_APP_SUPABASE_URL;
    REACT_APP_SUPABASE_ANON_KEY = envVars.REACT_APP_SUPABASE_ANON_KEY;
  } catch (error) {
    console.warn('Could not load @env:', error);
  }
}

// Preveri ali so environment variables nastavljene
if (!REACT_APP_SUPABASE_URL || !REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase configuration is missing!\n' +
    'Please check that your .env file contains:\n' +
    '- REACT_APP_SUPABASE_URL\n' +
    '- REACT_APP_SUPABASE_ANON_KEY'
  );
}

const redirectUrl = AuthSession.makeRedirectUri({
  useProxy: true
});

export const supabase = createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: redirectUrl,
  },
  realtime: {
    enabled: false,
  },
});

// Manage token refresh based on app state
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default supabase;
