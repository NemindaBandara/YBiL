import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Wifi, WifiOff, User, LogOut } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              YBiL <span className="text-blue-500">Colombo</span>
            </h1>
            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[10px] font-medium border ${
                isOnline
                  ? 'border-emerald-800 bg-emerald-950/80 text-emerald-400'
                  : 'border-amber-800 bg-amber-950/80 text-amber-400'
              }`}
            >
              {isOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Central Bus Stand Departures</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Trigger Button */}
          <button
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            title="Sync Timetable"
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Auth Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5">
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">{user.username}</span>
              <button
                onClick={logout}
                title="Sign Out"
                className="ml-1 text-slate-500 hover:text-red-400"
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