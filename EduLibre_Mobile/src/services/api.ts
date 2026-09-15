import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

//export const API_URL = 'http://10.10.1.170:3001/'; wi-fi integrado
//export const API_URL = 'http://10.0.0.11:3001'; 
//export const API_URL = 'http://10.10.41.171:3001'; // wifi integrow
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error(
    'Defina EXPO_PUBLIC_API_URL no arquivo .env.local do projeto mobile.',
  );
}

export const API_URL = configuredApiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('edulivre_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;