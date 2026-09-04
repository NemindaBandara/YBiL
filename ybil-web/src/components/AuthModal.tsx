import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";
import { X, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthApiResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    username: string;
    role: "PASSENGER" | "ADMIN";
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim();

    if (isRegisterMode) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify both fields.");
        return;
      }
    }

    setIsSubmitting(true);
    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await apiClient<AuthApiResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      if (isRegisterMode) {
        // Switch to login mode and prompt the user to sign in
        setIsRegisterMode(false);
        setPassword("");
        setConfirmPassword("");
        setSuccessMessage(
          "Account created successfully! Please sign in with your password.",
        );
      } else {
        const token = response.accessToken || response.token;
        if (!token) {
          throw new Error(
            "No access token received from authentication server.",
          );
        }

        const authPayload = {
          accessToken: token,
          refreshToken: response.refreshToken,
          user: response.user || {
            id: "",
            username: cleanUsername,
            role: "PASSENGER" as const,
          },
        };

        login(authPayload);
        handleClose();
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 transition-colors">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isRegisterMode ? "Create Account" : "Passenger Login"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-950"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-950"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : isRegisterMode
                ? "Sign Up"
                : "Log In"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          {isRegisterMode ? "Already registered?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {isRegisterMode ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
