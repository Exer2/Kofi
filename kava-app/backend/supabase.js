import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables z multiple fallbacks
let supabaseUrl, supabaseAnonKey;

if (Platform.OS === 'web') {
  // Web production build - read from environment variables
  supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 
               process.env.EXPO_PUBLIC_SUPABASE_URL;
               
  supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
} else {
  // Mobile platforms
  try {
    const { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } = require('@env');
    supabaseUrl = REACT_APP_SUPABASE_URL;
    supabaseAnonKey = REACT_APP_SUPABASE_ANON_KEY;
  } catch (error) {
    if (__DEV__) {
      console.warn('Could not load @env');
    }
    supabaseUrl = null;
    supabaseAnonKey = null;
  }
}

// Validate that environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  if (__DEV__) {
    console.error('Supabase configuration missing!');
    console.error('Please ensure the following environment variables are set:');
    console.error('- REACT_APP_SUPABASE_URL');
    console.error('- REACT_APP_SUPABASE_ANON_KEY');
  }
  throw new Error('Supabase configuration is missing. Check your environment variables.');
}

// Storage adapter
const storage = Platform.OS === 'web' ? 
  {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
  } : 
  AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
  realtime: {
    enabled: false, // Enable realtime for all platforms
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
