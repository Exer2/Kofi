// filepath: d:\Elchi\Kofi\Kofi\kava-app\services\api.js
import axios from 'axios';
import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '@env';

const api = axios.create({
  baseURL: REACT_APP_SUPABASE_URL,
  headers: {
    apiKey: REACT_APP_SUPABASE_ANON_KEY,
  },
});

export default api;