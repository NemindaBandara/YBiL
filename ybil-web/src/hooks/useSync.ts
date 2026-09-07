import { useState, useEffect, useCallback } from 'react';
import { syncService, type SyncResult } from '../sync/syncService';
import { timetableRepository } from '../db/timetableRepository';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadLastSync = useCallback(async () => {
    const time = await timetableRepository.getLastSyncTime();
    setLastSyncTime(time);
  }, []);

  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setSyncError(null);

    const result = await syncService.runDeltaSync();

    if (!result.success && result.error) {
      setSyncError(result.error);
      const errLower = result.error.toLowerCase();
      if (
        errLower.includes('failed to fetch') ||
        errLower.includes('network') ||
        errLower.includes('offline')
      ) {
        setIsOnline(false);
      }
    } else {
      setIsOnline(true);
      setLastSyncTime(result.serverTime || Date.now());
    }

    setIsSyncing(false);
    return result;
  }, []);

  useEffect(() => {
    loadLastSync();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // Auto-sync on connection restore
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync on app start
    triggerSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, loadLastSync]);

  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    syncError,
    triggerSync,
  };
}