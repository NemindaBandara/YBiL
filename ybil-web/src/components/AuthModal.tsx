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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl sm:max-w-md border border-[#dce5e8] bg-white p-6 shadow-2xl dark:border-[#334155] dark:bg-[#162026] transition-all transform animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Pill */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#dce5e8] pb-3.5 dark:border-[#334155]">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#17232c] dark:text-white">
              {isRegisterMode
                ? "Create Passenger Account"
                : "Passenger Sign In"}
            </h2>
            <p className="text-xs text-[#75838c] dark:text-[#94a3b8] mt-0.5">
              {isRegisterMode
                ? "Sign up to save routes and mark your daily buses."
                : "Enter your credentials to access your saved trips."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="rounded-xl p-1.5 text-[#75838c] hover:bg-slate-100 hover:text-[#17232c] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#25856f]/30 bg-[#e9f8f3] p-3 text-xs text-[#25856f] dark:border-[#37be96]/40 dark:bg-[#25856f]/20 dark:text-[#37be96]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-[#17232c] dark:text-slate-300">
              Username
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#75838c] dark:text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-[#dce5e8] bg-[#f4f7f7] py-2.5 pl-10 pr-3 text-sm text-[#17232c] placeholder-[#75838c] focus:border-blue-600 focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:bg-[#162026] dark:focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#17232c] dark:text-slate-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#75838c] dark:text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-[#dce5e8] bg-[#f4f7f7] py-2.5 pl-10 pr-3 text-sm text-[#17232c] placeholder-[#75838c] focus:border-blue-600 focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:bg-[#162026] dark:focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="text-xs font-semibold text-[#17232c] dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <CheckCircle2 className="absolute left-3.5 top-3 h-4 w-4 text-[#75838c] dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[#dce5e8] bg-[#f4f7f7] py-2.5 pl-10 pr-3 text-sm text-[#17232c] placeholder-[#75838c] focus:border-blue-600 focus:bg-white focus:outline-none dark:border-[#334155] dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:bg-[#162026] dark:focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-[#17232c] hover:bg-slate-800 text-white font-display font-bold py-3 text-sm shadow-md transition-all duration-150 disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950"
          >
            {isSubmitting
              ? "Processing..."
              : isRegisterMode
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-[#75838c] dark:text-[#94a3b8]">
          {isRegisterMode ? "Already registered?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-bold text-blue-600 hover:underline dark:text-cyan-400 ml-1"
          >
            {isRegisterMode ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
