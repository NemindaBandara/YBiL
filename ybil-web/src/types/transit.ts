import type { TimetableEntryResponse } from './api';

export type OperatorType = 'SLTB' | 'PRIVATE';

export type BusCategory = 'NORMAL' | 'SEMI' | 'LUXURY_AC' | 'EXPRESSWAY';

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
  busCategory: BusCategory;
  busNumber?: string;
  scheduledParkingTime: string; // "HH:mm"
  scheduledLeavingTime: string; // "HH:mm"
  updatedAt: number;            // Epoch millis
}

export interface SyncMetadata {
  key: string;
  value: string;
}

export interface MarkedTrip {
  id: string;
  timetableEntry: TimetableEntryResponse;
  status: 'ACTIVE' | 'MISSED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface MarkTripPayload {
  timetableEntryId: string;
}