import { apiClient } from '../api/client';
import { db } from '../db/database';
import { timetableRepository } from '../db/timetableRepository';
import type { DeltaSyncResponse } from '../types/api';
import type { TimetableEntry, Route } from '../types/transit';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  serverTime: number;
  error?: string;
}

export const syncService = {
  async runDeltaSync(): Promise<SyncResult> {
    try {
      const localCount = await db.timetable.count();
      const lastSyncedAt = localCount > 0 ? await timetableRepository.getLastSyncTime() : 0;
      const queryParam = lastSyncedAt > 0 ? `?since=${lastSyncedAt}` : '';
      const response = await apiClient<DeltaSyncResponse>(`/api/public/timetable/sync${queryParam}`);

      const entries = response?.entries || [];
      const syncedAt = response?.syncedAt || Date.now();
      const totalCount = response?.totalCount ?? entries.length;

      // Handle deleted entries if any
      if (response?.deletedEntryIds && response.deletedEntryIds.length > 0) {
        await db.timetable.bulkDelete(response.deletedEntryIds);
      }

      if (entries.length > 0) {
        const routesMap = new Map<string, Route>();
        const timetableEntries: TimetableEntry[] = [];

        for (const item of entries) {
          if (item.route) {
            routesMap.set(item.route.id, {
              id: item.route.id,
              routeNumber: item.route.routeNumber,
              origin: item.route.origin,
              destination: item.route.destination,
            });
          }

          timetableEntries.push({
            id: item.id,
            routeId: item.route?.id ?? '',
            routeNumber: item.route?.routeNumber ?? '',
            origin: item.route?.origin ?? '',
            destination: item.route?.destination ?? '',
            operatorType: item.operatorType,
            busCategory: item.busCategory ?? 'NORMAL',
            busNumber: item.busNumber,
            scheduledParkingTime: item.scheduledParkingTime,
            scheduledLeavingTime: item.scheduledLeavingTime,
            updatedAt: item.updatedAt,
          });
        }

        await db.transaction('rw', db.routes, db.timetable, db.syncMeta, async () => {
          await db.routes.bulkPut(Array.from(routesMap.values()));
          await db.timetable.bulkPut(timetableEntries);
          await timetableRepository.setLastSyncTime(syncedAt);
        });
      } else {
        await timetableRepository.setLastSyncTime(syncedAt);
      }

      return {
        success: true,
        syncedCount: totalCount,
        serverTime: syncedAt,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown synchronization error';
      return {
        success: false,
        syncedCount: 0,
        serverTime: 0,
        error: errorMessage,
      };
    }
  },

  async resetAndSync(): Promise<SyncResult> {
    await db.transaction('rw', db.routes, db.timetable, db.syncMeta, async () => {
      await db.routes.clear();
      await db.timetable.clear();
      await db.syncMeta.clear();
    });
    return this.runDeltaSync();
  }
};