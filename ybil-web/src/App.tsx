import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl text-center">
        <h1 className="text-xl font-bold text-blue-400">YBiL Auth State</h1>

        {isAuthenticated && user ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-left">
              <p className="text-xs text-slate-400">Logged in as:</p>
              <p className="text-sm font-semibold text-slate-100">{user.username}</p>
              <p className="text-xs text-blue-400 uppercase tracking-wider mt-1">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-400">No active session found</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Log In / Register
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}