import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../context/ThemeContext";
import { RefreshCw, User, Sun, Moon, Monitor } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isSyncing,
  onSync,
  onOpenAccount,
}) => {
  const { user, isAuthenticated } = useAuth();
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
        return <Moon className="h-4 w-4 text-cyan-400" />;
      case "system":
      default:
        return (
          <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 bg-white/95 dark:bg-[#162026]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {/* Left Section: Identity & Status */}
        <div className="inline-flex items-center gap-2.5 min-w-0">
          {/* App Avatar with Mobile Status Badge */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-xs font-black shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <span className="text-[#2563eb] dark:text-cyan-400">Y</span>B
            </div>
            {/* Mobile Status Dot on Avatar Corner */}
            <span
              className="sm:hidden absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
              title={isOnline ? "ONLINE" : "OFFLINE"}
            >
              {isOnline && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#162026] ${
                  isOnline ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </span>
          </div>

          {/* Title Stack */}
          <div className="min-w-0">
            {/* Top line: YBiL Colombo & Status Pill */}
            <div className="flex items-center gap-2 truncate">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                YBiL{" "}
                <span className="text-[#2563eb] dark:text-cyan-400 font-semibold">
                  Colombo
                </span>
              </h1>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors shrink-0 ${
                  isOnline
                    ? "bg-[#e9f8f3] text-[#25856f] border border-[#25856f]/20 dark:bg-[#25856f]/20 dark:text-[#37be96] dark:border-[#37be96]/30"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOnline ? "bg-[#37be96] animate-pulse" : "bg-rose-500"
                  }`}
                />
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            {/* Bottom line: Station location */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 truncate leading-tight mt-0.5">
              <span>Central Bus Stand</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Departures</span>
            </p>
          </div>
        </div>

        {/* Right Section: Mobile Action Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            type="button"
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            aria-label="Switch theme mode"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-transform relative before:absolute before:-inset-1 before:content-['']"
          >
            {renderThemeIcon()}
          </button>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            type="button"
            title={
              isSyncing
                ? "Syncing..."
                : isOnline
                  ? "Sync Timetable"
                  : "Attempt Reconnect & Sync"
            }
            aria-label="Sync Timetable"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-transform disabled:opacity-40 relative before:absolute before:-inset-1 before:content-['']"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin text-blue-600 dark:text-cyan-400" : ""}`}
            />
          </button>

          {/* Profile / Account Icon Button */}
          <button
            onClick={onOpenAccount}
            type="button"
            title={
              isAuthenticated && user
                ? `Account: ${user.username} (${user.role})`
                : "My Account"
            }
            aria-label="My Account"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-transform relative before:absolute before:-inset-1 before:content-[''] ${
              isAuthenticated
                ? "border-blue-300 bg-blue-50/70 text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-cyan-400"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
