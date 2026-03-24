import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Use full hosted URL for production, or your machine's IP for local testing on a physical device.
// IMPORTANT: For production APK/IPA, this MUST be a publicly accessible URL (e.g. https://your-app.vercel.app/api)
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://192.168.31.25:8081/api").replace(/\/$/, ""); 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Adjust if backend uses cookies or different auth header
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
