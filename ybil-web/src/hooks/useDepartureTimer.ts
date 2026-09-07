import { useMemo } from 'react';
import { useLiveClock } from './useLiveClock';
import { getDepartureStatus, type DepartureStatus } from '../utils/timeUtils';

/**
 * Custom hook that evaluates a bus's scheduled leaving time against a live ticking clock
 * at a configurable interval (defaults to 15 seconds) so countdowns tick smoothly
 * without excessive re-renders.
 */
export function useDepartureTimer(
  scheduledLeavingTime: string,
  intervalMs: number = 15000
): DepartureStatus {
  const now = useLiveClock(intervalMs);

  return useMemo(
    () => getDepartureStatus(scheduledLeavingTime, now),
    [scheduledLeavingTime, now]
  );
}

