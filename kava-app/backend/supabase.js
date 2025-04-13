import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '@env';
import * as AuthSession from 'expo-auth-session';

const redirectUrl = AuthSession.makeRedirectUri({
  useProxy: true // This enables the Expo AuthSession proxy
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
