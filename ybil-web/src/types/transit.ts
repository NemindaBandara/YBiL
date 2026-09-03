export type OperatorType = 'SLTB' | 'PRIVATE';

export interface Route {
  id: string;
  routeNumber: string;
  origin: string;
  destination: string;
}

export interface TimetableEntry {
  id: string;
  routeId: string;
  routeNumber: string;
  origin: string;
  destination: string;
  operatorType: OperatorType;
  busNumber?: string;
  scheduledParkingTime: string; // "HH:mm"
  scheduledLeavingTime: string; // "HH:mm"
  updatedAt: number;            // Epoch millis
}

export interface SyncMetadata {
  key: string;
  value: string;
}