import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  const applySession = useCallback((data) => {
    setUser(data?.user ?? null);
    setSavedCount(data?.saved_count ?? 0);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get("/session");
      applySession(data);
      setBootError(null);
    } catch (error) {
      setBootError(error.message || "No pudimos conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const retry = useCallback(() => {
    setBootError(null);
    setLoading(true);
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (payload) => {
      const data = await api.post("/auth/login", payload);
      applySession(data);
      return data;
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await api.post("/auth/signup", payload);
      applySession(data);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    const data = await api.post("/auth/logout");
    setUser(null);
    setSavedCount(0);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      savedCount,
      loading,
      bootError,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refresh,
      retry,
      setSavedCount,
    }),
    [user, savedCount, loading, bootError, login, signup, logout, refresh, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
