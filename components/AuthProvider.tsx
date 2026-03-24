import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

// NextAuth is used on the web. We have to implement our own session provider here using the JWT token or create a new endpoint in Next.js to issue a token / basic auth for the native app.
// Wait, NextAuth uses cookies. For an Expo app, the easiest way to talk to NextAuth API is to use cookies or write a custom login endpoint in your Next.js app to return a JWT for the mobile app.
// I will create an AuthContext to manage this. I will assume the user has a custom login endpoint or I will create one.

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => false,
  signUp: async () => ({ success: false }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      const storedToken = await SecureStore.getItemAsync("userToken");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data && res.data.token) {
        setUser(res.data.user);

        const tokenLen = res.data.token.length;
        console.log(`DEBUG: Storing token (len: ${tokenLen})`);
        await SecureStore.setItemAsync("userToken", res.data.token);

        // Strip image to avoid SecureStore 2KB limit on some Android devices
        const { image, ...minimalUser } = res.data.user;
        const userJson = JSON.stringify(minimalUser);
        console.log(`DEBUG: Storing user JSON (len: ${userJson.length})`);
        await SecureStore.setItemAsync("user", userJson);

        return true;
      }
      return false;
    } catch (e: any) {
      console.error("Sign in error", e?.response?.data || e.message);
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (res.data && res.data.token) {
        setUser(res.data.user);

        const tokenLen = res.data.token.length;
        console.log(`DEBUG: Storing token (len: ${tokenLen})`);
        await SecureStore.setItemAsync("userToken", res.data.token);

        // Strip image to avoid SecureStore 2KB limit on some Android devices
        const { image, ...minimalUser } = res.data.user;
        const userJson = JSON.stringify(minimalUser);
        console.log(`DEBUG: Storing user JSON (len: ${userJson.length})`);
        await SecureStore.setItemAsync("user", userJson);

        return { success: true };
      }
      return { success: false, error: "Registration failed." };
    } catch (e: any) {
      console.error("Sign up error", e?.response?.data || e.message);
      return {
        success: false,
        error:
          e?.response?.data?.message ||
          e.message ||
          "Unknown error occurred during sign up.",
      };
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("userToken");
      setUser(null);
      router.replace("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
