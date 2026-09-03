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
    if (!navigator.onLine) {
      return { success: false, syncedCount: 0, serverTime: 0, error: 'Device is offline' };
    }

    setIsSyncing(true);
    setSyncError(null);

    const result = await syncService.runDeltaSync();

    if (!result.success && result.error) {
      setSyncError(result.error);
    } else {
      setLastSyncTime(result.serverTime);
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