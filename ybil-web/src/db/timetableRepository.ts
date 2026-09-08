import { db } from './database';
import type { TimetableEntry, Route } from '../types/transit';
import { apiClient } from '../api/client';

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

  // Save or update a single route
  async upsertRoute(route: Route): Promise<void> {
    await db.routes.put(route);
  },

  // Save or update a single entry
  async upsertEntry(entry: TimetableEntry): Promise<void> {
    await db.timetable.put(entry);
  },

  // Delete a single entry
  async deleteEntry(id: string): Promise<void> {
    await db.timetable.delete(id);
  },

  // Get all cached routes
  async getAllRoutes(): Promise<Route[]> {
    return db.routes.toArray();
  },

  // Fetch routes from server and update local cache
  async syncRoutesFromServer(): Promise<Route[]> {
    try {
      const routes = await apiClient<Route[]>('/api/admin/routes');
      if (Array.isArray(routes) && routes.length > 0) {
        await db.routes.bulkPut(routes);
        return routes;
      }
    } catch {
      try {
        const publicRoutes = await apiClient<Route[]>('/api/public/routes');
        if (Array.isArray(publicRoutes) && publicRoutes.length > 0) {
          await db.routes.bulkPut(publicRoutes);
          return publicRoutes;
        }
      } catch {
        // Network offline, return cached
      }
    }
    return db.routes.toArray();
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