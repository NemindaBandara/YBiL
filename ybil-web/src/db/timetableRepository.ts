import { db } from './database';
import type { TimetableEntry, Route } from '../types/transit';

export const timetableRepository = {
  // Get all cached entries sorted by leaving time
  async getAllEntries(): Promise<TimetableEntry[]> {
    return db.timetable.orderBy('scheduledLeavingTime').toArray();
  },

  // Get entries filtered by route
  async getEntriesByRoute(routeId: string): Promise<TimetableEntry[]> {
    return db.timetable
      .where('routeId')
      .equals(routeId)
      .sortBy('scheduledLeavingTime');
  },

  // Missed-bus fallback query (alternatives departing after a given time)
  async getNextAlternatives(routeId: string, afterTime: string): Promise<TimetableEntry[]> {
    return db.timetable
      .where('routeId')
      .equals(routeId)
      .filter((entry) => entry.scheduledLeavingTime > afterTime)
      .sortBy('scheduledLeavingTime');
  },

  // Save or update synced entries
  async upsertEntries(entries: TimetableEntry[]): Promise<void> {
    await db.timetable.bulkPut(entries);
  },

  // Cache routes
  async upsertRoutes(routes: Route[]): Promise<void> {
    await db.routes.bulkPut(routes);
  },

  // Sync timestamp tracking
  async getLastSyncTime(): Promise<number> {
    const record = await db.syncMeta.get('last_synced_at');
    return record ? Number(record.value) : 0;
  },

  async setLastSyncTime(epochMilli: number): Promise<void> {
    await db.syncMeta.put({
      key: 'last_synced_at',
      value: epochMilli.toString()
    });
  }
};