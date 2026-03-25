import axios, { AxiosInstance, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import * as NetInfo from '@react-native-community/netinfo';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? "http://192.168.31.25:8081/api" : "https://our-journey-app-ten.vercel.app/api")).replace(/\/$/, ""); 

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, 
});

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;

api.interceptors.request.use(
  async (config) => {
    // 1. Check network connectivity before sending request
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error("No internet connection"));
    }

    // 2. Attach Authorization Token
    const token = await SecureStore.getItemAsync("token") || await SecureStore.getItemAsync("userToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Set a retry count if it doesn't exist
    (config as any).retryCount = (config as any).retryCount || 0;
    
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Don't retry if config doesn't exist or it's a client error (except timeout/network error)
    if (!config || (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 408)) {
      return Promise.reject(error);
    }
    
    if (config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;
      
      // Exponential backoff
      const delay = Math.pow(2, config.retryCount) * 1000;
      await sleep(delay);
      
      // Retry request
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;
