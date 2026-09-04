import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";
import { X, Lock, User, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthApiResponse {
  accessToken?: string;
  token?: string; // Fallback in case your backend returns 'token'
  refreshToken?: string;
  user?: {
    id: string;
    username: string;
    role: "PASSENGER" | "ADMIN";
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await apiClient<AuthApiResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const token = response.accessToken || response.token;
      if (!token) {
        throw new Error("No access token received from authentication server.");
      }

      const authPayload = {
        accessToken: token,
        refreshToken: response.refreshToken,
        user: response.user || {
          id: "", // AuthContext will fill the ID from token sub
          username: username.trim(), // <--- USE THE ENTERED USERNAME DIRECTLY
          role: "PASSENGER" as const,
        },
      };

      if (isRegisterMode) {
        register(authPayload);
      } else {
        login(authPayload);
      }

      handleClose();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Authentication failed. Please check credentials.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100">
            {isRegisterMode ? "Create Account" : "Passenger Login"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : isRegisterMode
                ? "Sign Up"
                : "Log In"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          {isRegisterMode ? "Already registered?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="font-semibold text-blue-400 hover:underline"
          >
            {isRegisterMode ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
