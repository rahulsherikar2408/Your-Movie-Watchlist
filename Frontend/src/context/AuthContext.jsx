import React, { useCallback, useEffect, useState } from "react";

import api from "../services/api.js";
import { AuthContext } from "./authContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const nextUser = response?.data?.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signup = async (userData) => {
    const response = await api.post("/auth/register", userData);
    const nextUser = response?.data?.user ?? null;
    if (response?.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    setUser(nextUser);
    return response?.data ?? {};
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const nextUser = response?.data?.user ?? null;
    if (response?.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    setUser(nextUser);
    return response?.data ?? {};
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signup,
    login,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
