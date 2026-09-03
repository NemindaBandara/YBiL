import { useSync } from './hooks/useSync';
import { useState, useEffect } from 'react';
import { timetableRepository } from './db/timetableRepository';
import type { TimetableEntry } from './types/transit';

export default function App() {
  const { isSyncing, isOnline, lastSyncTime, syncError, triggerSync } = useSync();
  const [cachedBuses, setCachedBuses] = useState<TimetableEntry[]>([]);

  const refreshLocalData = async () => {
    const list = await timetableRepository.getAllEntries();
    setCachedBuses(list);
  };

  useEffect(() => {
    refreshLocalData();
  }, [lastSyncTime]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-blue-400">YBiL Sync Engine</h1>
            <p className="text-xs text-slate-400">
              {isOnline ? '🟢 Connected to Server' : '🔴 Offline (Local Cache)'}
            </p>
          </div>
          <button
            onClick={() => triggerSync().then(refreshLocalData)}
            disabled={isSyncing}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {syncError && (
          <div className="mt-4 rounded-lg bg-red-950/60 p-3 text-xs text-red-400 border border-red-800">
            {syncError}
          </div>
        )}

        <div className="mt-4 space-y-1 text-xs text-slate-400">
          <p>Last Synced Checkpoint: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}</p>
          <p>Buses in Local IndexedDB: <span className="font-semibold text-slate-200">{cachedBuses.length}</span></p>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
          {cachedBuses.map((bus) => (
            <div key={bus.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
              <div className="flex justify-between font-medium text-slate-200">
                <span>Route {bus.routeNumber} ({bus.origin} → {bus.destination})</span>
                <span className={bus.operatorType === 'SLTB' ? 'text-red-400' : 'text-blue-400'}>
                  {bus.operatorType}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Departure: {bus.scheduledLeavingTime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}