import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../context/ThemeContext";
import { RefreshCw, User, LogOut, Sun, Moon, Monitor } from "lucide-react";

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
        return <Moon className="h-4 w-4 text-cyan-400" />;
      case "system":
      default:
        return (
          <Monitor className="h-4 w-4 text-[#75838c] dark:text-[#94a3b8]" />
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#dce5e8] bg-white/90 dark:border-[#334155] dark:bg-[#162026]/90 backdrop-blur-md px-4 py-2.5 transition-colors">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {/* Left: Monogram Block + Title + Location Subtitle */}
        <div className="flex items-center gap-3">
          {/* YBiL Monogram Box */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17232c] text-white shadow-sm ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
            <span className="font-display text-sm font-black tracking-wider text-cyan-400">
              Y<span className="text-white">B</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-extrabold tracking-tight text-[#17232c] dark:text-white leading-none">
                YBiL{" "}
                <span className="font-sans font-medium text-xs text-blue-600 dark:text-cyan-400">
                  Colombo
                </span>
              </h1>

              {/* Online / Offline Pill */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                  isOnline
                    ? "bg-[#e9f8f3] text-[#25856f] border border-[#25856f]/20 dark:bg-[#25856f]/20 dark:text-[#37be96] dark:border-[#37be96]/30"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {isOnline && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#37be96] opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                      isOnline ? "bg-[#37be96]" : "bg-amber-500"
                    }`}
                  ></span>
                </span>
                {isOnline ? "Live Sync" : "Offline"}
              </span>
            </div>

            <p className="mt-0.5 text-[11px] font-medium text-[#75838c] dark:text-[#94a3b8] leading-tight">
              Central Bus Stand Departures
            </p>
          </div>
        </div>

        {/* Right: Controls & Auth Trigger */}
        <div className="flex items-center gap-1.5">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={cycleTheme}
            type="button"
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
            aria-label="Switch theme mode"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce5e8] bg-white text-[#17232c] transition hover:bg-slate-100 dark:border-[#334155] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {renderThemeIcon()}
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            type="button"
            title="Sync Timetable"
            aria-label="Sync Timetable"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce5e8] bg-white text-[#17232c] transition hover:bg-slate-100 disabled:opacity-40 dark:border-[#334155] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin text-blue-600 dark:text-cyan-400" : ""}`}
            />
          </button>

          {/* Auth Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#dce5e8] bg-white px-2.5 py-1.5 shadow-sm dark:border-[#334155] dark:bg-slate-900">
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-[#17232c] dark:text-slate-200 max-w-[70px] truncate">
                {user.username}
              </span>
              <button
                onClick={logout}
                type="button"
                title="Sign Out"
                aria-label="Sign Out"
                className="ml-0.5 text-[#75838c] hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              type="button"
              className="rounded-xl bg-[#17232c] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500 font-display tracking-wide"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
