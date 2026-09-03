import Dexie, { type Table } from 'dexie';
import type { Route, TimetableEntry, SyncMetadata } from '../types/transit';

export class YbilDatabase extends Dexie {
  routes!: Table<Route, string>;
  timetable!: Table<TimetableEntry, string>;
  syncMeta!: Table<SyncMetadata, string>;

  constructor() {
    super('YBiL_Database');

    this.version(1).stores({
      routes: 'id, routeNumber, origin, destination',
      timetable: 'id, routeId, scheduledLeavingTime, updatedAt',
      syncMeta: 'key'
    });
  }
}

export const db = new YbilDatabase();