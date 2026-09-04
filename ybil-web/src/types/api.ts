import type { Route, OperatorType } from './transit';

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