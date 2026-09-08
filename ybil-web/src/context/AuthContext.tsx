/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient } from "../api/client";

export interface AuthUser {
  id: string;
  username: string;
  role: "PASSENGER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
  }) => void;
  register: (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
  }) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Decode JWT payload safely and inspect all standard Spring Security / OAuth claims
  const parseUserFromJwt = (token: string): AuthUser | null => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);

      let detectedRole: "PASSENGER" | "ADMIN" = "PASSENGER";

      const checkIsAdminString = (val: unknown): boolean => {
        if (typeof val === "string") {
          const u = val.toUpperCase();
          return u === "ADMIN" || u === "ROLE_ADMIN";
        }
        if (typeof val === "object" && val !== null && "authority" in val) {
          return checkIsAdminString((val as { authority: unknown }).authority);
        }
        return false;
      };

      const raw =
        payload.role ??
        payload.roles ??
        payload.authorities ??
        payload.scope ??
        payload.auth;

      if (Array.isArray(raw)) {
        if (raw.some(checkIsAdminString)) {
          detectedRole = "ADMIN";
        }
      } else if (checkIsAdminString(raw)) {
        detectedRole = "ADMIN";
      }

      return {
        id: payload.userId || payload.id || payload.sub || "",
        username: payload.username || payload.sub || "Passenger",
        role: detectedRole,
      };
    } catch {
      return null;
    }
  };

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const profile = await apiClient<AuthUser>("/api/auth/me");
      if (profile && profile.username) {
        const normalized: AuthUser = {
          id: profile.id,
          username: profile.username,
          role:
            (profile.role as string) === "ROLE_ADMIN" ||
            profile.role === "ADMIN"
              ? "ADMIN"
              : "PASSENGER",
        };
        localStorage.setItem("user_data", JSON.stringify(normalized));
        setUser(normalized);
        return normalized;
      }
    } catch {
      // Endpoint error or network offline
    }
    return null;
  }, []);

  const updateUser = useCallback((updated: AuthUser) => {
    const normalized: AuthUser = {
      ...updated,
      role:
        (updated.role as string) === "ROLE_ADMIN" || updated.role === "ADMIN"
          ? "ADMIN"
          : "PASSENGER",
    };
    localStorage.setItem("user_data", JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  // Synchronize authentication tokens and update React state immediately
  const persistSession = (data: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
  }) => {
    localStorage.setItem("access_token", data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem("refresh_token", data.refreshToken);
    }

    const resolvedUser = data.user || parseUserFromJwt(data.accessToken);
    if (resolvedUser) {
      const normalized: AuthUser = {
        ...resolvedUser,
        role:
          (resolvedUser.role as string) === "ROLE_ADMIN" ||
          resolvedUser.role === "ADMIN"
            ? "ADMIN"
            : "PASSENGER",
      };
      localStorage.setItem("user_data", JSON.stringify(normalized));
      setUser(normalized);
    }

    // Always fetch latest authoritative profile from /api/auth/me
    refreshUser();
  };

  // Restore session on initial mount / reload
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");

    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Fallback to token parsing if JSON is corrupt
        }
      } else {
        const extracted = parseUserFromJwt(token);
        if (extracted) {
          setUser(extracted);
        }
      }

      // Re-verify and sync with /api/auth/me
      refreshUser();
    }
  }, [refreshUser]);

  const login = (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
  }) => {
    persistSession(payload);
  };

  const register = (payload: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
  }) => {
    persistSession(payload);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
