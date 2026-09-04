import type { Route, OperatorType, BusCategory } from './transit';

export interface RouteResponse {
  id: string;
  routeNumber: string;
  origin: string;
  destination: string;
}

export interface TimetableEntryResponse {
  id: string;
  route: RouteResponse;
  operatorType: OperatorType;
  busCategory?: BusCategory;
  busNumber?: string;
  scheduledParkingTime: string;
  scheduledLeavingTime: string;
  updatedAt: number;
}

export interface DeltaSyncResponse {
  syncedAt: number;
  totalCount: number;
  entries: TimetableEntryResponse[];
  deletedEntryIds?: string[];
}