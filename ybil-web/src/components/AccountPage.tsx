import React, { useEffect, useState } from "react";
import { useAuth, type AuthUser } from "../context/AuthContext";
import { apiClient } from "../api/client";
import {
  ArrowLeft,
  LogOut,
  User,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogIn,
} from "lucide-react";

interface AccountPageProps {
  onBack: () => void;
  onOpenAuth: () => void;
  isOnline: boolean;
  lastSyncTime: number;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onBack,
  onOpenAuth,
  isOnline,
  lastSyncTime,
}) => {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const [userData, setUserData] = useState<AuthUser | null>(authUser);
  const [copied, setCopied] = useState(false);

  // Fetch updated user details from /api/auth/me if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      apiClient<AuthUser>("/api/auth/me")
        .then((data) => {
          if (data && data.username) {
            setUserData(data);
          }
        })
        .catch(() => {
          // Fallback to local auth context user
          setUserData(authUser);
        });
    } else {
      setUserData(null);
    }
  }, [isAuthenticated, authUser]);

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    onBack();
  };

  const displayUser = userData || authUser;
  const initial = displayUser?.username
    ? displayUser.username.charAt(0).toUpperCase()
    : "G";
  const role = displayUser?.role || "PASSENGER";

  const formattedSyncTime =
    lastSyncTime > 0
      ? new Date(lastSyncTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Not synced yet";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* A. Top Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            type="button"
            title="Go back"
            aria-label="Go back to departures"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition-transform relative before:absolute before:-inset-1 before:content-['']"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            My Account
          </h1>
        </div>
      </div>

      {/* B. User Profile Card */}
      <div className="bg-white dark:bg-[#162026] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center transition-colors">
        {/* User Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-slate-100 dark:ring-slate-800/80">
            {isAuthenticated ? (
              initial
            ) : (
              <User className="h-7 w-7 text-slate-400" />
            )}
          </div>
          {/* Status Dot */}
          <span
            className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-[#162026] ${
              isOnline ? "bg-emerald-500" : "bg-amber-500"
            }`}
            title={isOnline ? "Connected" : "Offline"}
          />
        </div>

        {/* Username */}
        <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          {isAuthenticated && displayUser
            ? displayUser.username
            : "Guest Passenger"}
        </h2>

        {/* Role Badge */}
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              role === "ADMIN"
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-cyan-400 dark:border-blue-800/60"
            }`}
          >
            {role}
          </span>
        </div>

        {/* User ID */}
        {isAuthenticated && displayUser?.id && (
          <div className="mt-2.5 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono select-all truncate max-w-[200px]">
              ID: {displayUser.id}
            </span>
            <button
              onClick={() => handleCopyId(displayUser.id)}
              type="button"
              title="Copy User ID"
              aria-label="Copy User ID"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* C. Details & Settings Section */}
      <div className="bg-white dark:bg-[#162026] rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs transition-colors">
        {/* Row 1: Account Type */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <Shield className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="font-medium">Account Type</span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide font-display uppercase">
            {role}
          </span>
        </div>

        {/* Row 2: Sync Status */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            {isOnline ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="font-medium">Sync Status</span>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span
                className={
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {isOnline ? "Connected" : "Offline"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              {lastSyncTime > 0
                ? `Synced at ${formattedSyncTime}`
                : "Pending initial sync"}
            </span>
          </div>
        </div>

        {/* Row 3: App Version */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <Smartphone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="font-medium">App Version</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            v1.0.0
          </span>
        </div>
      </div>

      {/* D. Action Button (Logout or Sign In) */}
      <div className="pt-2">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 active:scale-[0.99] text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/40 transition-all shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-[#17232c] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.99] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In or Register</span>
          </button>
        )}
      </div>
    </div>
  );
};
