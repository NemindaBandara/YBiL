import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../context/ThemeContext";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isSyncing,
  onSync,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const sequence: ThemeMode[] = ["light", "dark", "system"];
    const nextIndex = (sequence.indexOf(theme) + 1) % sequence.length;
    setTheme(sequence[nextIndex]);
  };

  const renderThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4 text-amber-500" />;
      case "dark":
        return <Moon className="h-4 w-4 text-blue-400" />;
      case "system":
      default:
        return (
          <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-md px-4 py-3 transition-colors">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              YBiL <span className="text-blue-500">Colombo</span>
            </h1>
            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[10px] font-medium border ${
                isOnline
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-400"
              }`}
            >
              {isOnline ? (
                <Wifi className="h-2.5 w-2.5" />
              ) : (
                <WifiOff className="h-2.5 w-2.5" />
              )}
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Central Bus Stand Departures
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {renderThemeIcon()}
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            title="Sync Timetable"
            className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin text-blue-500 dark:text-blue-400" : ""}`}
            />
          </button>

          {/* Auth Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <User className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user.username}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="ml-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
