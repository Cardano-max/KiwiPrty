import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "./api";

export interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  ready: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        const u = await AsyncStorage.getItem("user");
        if (t) {
          setToken(t);
          setAuthToken(t);
        }
        if (u) setUser(JSON.parse(u));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function login(phone: string, otp: string) {
    const { token: t, user: u } = await api.login(phone, otp);
    setToken(t);
    setAuthToken(t);
    setUser(u);
    await AsyncStorage.setItem("token", t);
    await AsyncStorage.setItem("user", JSON.stringify(u));
  }

  async function logout() {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
