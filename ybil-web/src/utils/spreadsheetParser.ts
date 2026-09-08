import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { OperatorType, BusCategory, Route } from '../types/transit';

export interface RawScheduleRow {
  routeNumber?: string;
  routeId?: string;
  operatorType?: string;
  busCategory?: string;
  busNumber?: string;
  scheduledParkingTime?: string;
  scheduledLeavingTime?: string;
  [key: string]: unknown;
}

export interface ValidatedScheduleRow {
  index: number;
  routeNumber: string;
  routeId: string;
  operatorType: OperatorType;
  busCategory: BusCategory;
  busNumber: string;
  scheduledParkingTime: string;
  scheduledLeavingTime: string;
  isValid: boolean;
  errors: Record<string, string>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RELAXED_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Normalizes varied time representations into strict 24-hour "HH:mm" format.
 * Handles:
 * - Excel fractional day decimals (e.g. 0.375 -> "09:00")
 * - Single-digit hour/minute strings (e.g. "9:5" -> "09:05")
 * - 12-hour timestamps with AM/PM (e.g. "4:30 PM" -> "16:30")
 * - Standard "HH:mm" strings
 */
export function normalizeTimeString(val: unknown): string {
  if (val === null || val === undefined) return '';

  // Case 1: Excel numeric time serial (fraction of a 24-hour day, between 0 and 1)
  if (typeof val === 'number' || (!isNaN(Number(val)) && !String(val).includes(':'))) {
    const num = Number(val);
    if (num >= 0 && num <= 1) {
      const totalSeconds = Math.round(num * 86400);
      const hours = Math.floor(totalSeconds / 3600) % 24;
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  const str = String(val).trim();
  if (!str) return '';

  // Case 2: 12-hour format with AM/PM (e.g. "04:30 PM" or "4:5 am")
  const ampmMatch = str.match(/^(\d{1,2}):(\d{1,2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Case 3: Colon-separated string (e.g. "9:5", "09:05", "14:30:00")
  const colonParts = str.split(':');
  if (colonParts.length >= 2) {
    const h = parseInt(colonParts[0].trim(), 10);
    const m = parseInt(colonParts[1].trim(), 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return str;
}

/**
 * Validates a normalized row against YBiL domain rules.
 * Resolves routeNumber to its UUID routeId using availableRoutes.
 */
export function validateScheduleRow(
  row: RawScheduleRow,
  index: number,
  availableRoutes: Route[] = []
): ValidatedScheduleRow {
  const errors: Record<string, string> = {};

  const rawRouteNumber = String(row.routeNumber || '').trim();
  const rawRouteId = String(row.routeId || '').trim();

  let resolvedRouteId = '';
  let resolvedRouteNumber = rawRouteNumber;

  if (rawRouteNumber) {
    const matched = availableRoutes.find(
      (r) => r.routeNumber.trim().toLowerCase() === rawRouteNumber.toLowerCase()
    );
    if (matched) {
      resolvedRouteId = matched.id;
      resolvedRouteNumber = matched.routeNumber;
    } else {
      errors.routeNumber = `Route "${rawRouteNumber}" not found. Create it under "Routes" tab first.`;
    }
  } else if (rawRouteId) {
    // Fallback: If routeId was given, look up routeNumber or check UUID
    if (UUID_REGEX.test(rawRouteId) || RELAXED_UUID_REGEX.test(rawRouteId)) {
      resolvedRouteId = rawRouteId;
      const matched = availableRoutes.find((r) => r.id === rawRouteId);
      if (matched) {
        resolvedRouteNumber = matched.routeNumber;
      } else {
        resolvedRouteNumber = 'ID: ' + rawRouteId.substring(0, 8);
      }
    } else {
      errors.routeNumber = 'Valid routeNumber or UUID routeId is required';
    }
  } else {
    errors.routeNumber = 'Route number is required (e.g. 138, 100, EX-01)';
  }

  // operatorType check
  const rawOperator = String(row.operatorType || '').trim().toUpperCase();
  let operatorType: OperatorType = 'SLTB';
  if (!rawOperator) {
    errors.operatorType = 'Operator is required (SLTB or PRIVATE)';
  } else if (rawOperator !== 'SLTB' && rawOperator !== 'PRIVATE') {
    errors.operatorType = 'Operator must be strictly SLTB or PRIVATE';
  } else {
    operatorType = rawOperator as OperatorType;
  }

  // busCategory check
  const rawCategory = String(row.busCategory || '').trim().toUpperCase();
  let busCategory: BusCategory = 'NORMAL';
  const VALID_CATEGORIES: BusCategory[] = [
    'NORMAL',
    'SEMI',
    'LUXURY_AC',
    'EXPRESSWAY',
  ];
  if (!rawCategory) {
    errors.busCategory = 'Category is required (NORMAL, SEMI, LUXURY_AC, EXPRESSWAY)';
  } else if (!VALID_CATEGORIES.includes(rawCategory as BusCategory)) {
    errors.busCategory =
      'Category must be NORMAL, SEMI, LUXURY_AC, or EXPRESSWAY';
  } else {
    busCategory = rawCategory as BusCategory;
  }

  // busNumber check
  const busNumber = String(row.busNumber || '').trim();
  if (!busNumber) {
    errors.busNumber = 'Bus Number is required';
  }

  // scheduledParkingTime check
  const scheduledParkingTime = normalizeTimeString(row.scheduledParkingTime);
  if (!scheduledParkingTime) {
    errors.scheduledParkingTime = 'Parking Time is required';
  } else if (!TIME_24H_REGEX.test(scheduledParkingTime)) {
    errors.scheduledParkingTime = 'Parking Time must be HH:mm 24-hour format';
  }

  // scheduledLeavingTime check
  const scheduledLeavingTime = normalizeTimeString(row.scheduledLeavingTime);
  if (!scheduledLeavingTime) {
    errors.scheduledLeavingTime = 'Leaving Time is required';
  } else if (!TIME_24H_REGEX.test(scheduledLeavingTime)) {
    errors.scheduledLeavingTime = 'Leaving Time must be HH:mm 24-hour format';
  }

  return {
    index,
    routeNumber: resolvedRouteNumber,
    routeId: resolvedRouteId,
    operatorType,
    busCategory,
    busNumber,
    scheduledParkingTime,
    scheduledLeavingTime,
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parses a CSV file using PapaParse, validating routes against availableRoutes.
 */
export async function parseCSV(
  file: File,
  availableRoutes: Route[] = []
): Promise<ValidatedScheduleRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawScheduleRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const rows = (results.data || []).map((row, idx) =>
          validateScheduleRow(row, idx + 1, availableRoutes)
        );
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Parses an Excel (.xlsx, .xls) file using SheetJS, validating routes against availableRoutes.
 */
export async function parseExcel(
  file: File,
  availableRoutes: Route[] = []
): Promise<ValidatedScheduleRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: RawScheduleRow[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  return rawRows.map((row, idx) =>
    validateScheduleRow(row, idx + 1, availableRoutes)
  );
}

/**
 * Parses raw JSON string input into validated schedule rows using availableRoutes.
 */
export function parseRawJSON(
  jsonString: string,
  availableRoutes: Route[] = []
): ValidatedScheduleRow[] {
  const trimmed = jsonString.trim();
  if (!trimmed) return [];

  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw new Error('Input must be a JSON array of departure schedule objects');
  }

  return parsed.map((row: RawScheduleRow, idx: number) =>
    validateScheduleRow(row, idx + 1, availableRoutes)
  );
}

/**
 * Generates and triggers the download of the standard YBiL schedule CSV template with routeNumber.
 */
export function downloadCSVTemplate(): void {
  const headers = [
    'routeNumber',
    'operatorType',
    'busCategory',
    'busNumber',
    'scheduledParkingTime',
    'scheduledLeavingTime',
  ];

  const sampleRows = [
    ['138', 'SLTB', 'NORMAL', 'NB-1234', '08:45', '09:00'],
    ['100', 'PRIVATE', 'LUXURY_AC', 'WP-5678', '09:15', '09:30'],
    ['EX-01', 'SLTB', 'EXPRESSWAY', 'NC-9999', '10:00', '10:45'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ybil_timetable_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
