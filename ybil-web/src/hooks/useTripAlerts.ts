import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimetableEntry, BusCategory } from '../types/transit';
import { parseTimeToToday } from '../utils/timeUtils';

const STORAGE_KEY = 'trackedTrips';
const ALERTED_STAGES_KEY = 'ybil_alerted_stages';

interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  vibrate?: number[];
}

function getStoredTrackedTrips(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not parse trackedTrips from localStorage', err);
    return [];
  }
}

function saveStoredTrackedTrips(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Could not save trackedTrips to localStorage', err);
  }
}

function loadAlertedKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(ALERTED_STAGES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveAlertedKey(set: Set<string>, key: string): void {
  set.add(key);
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ALERTED_STAGES_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota errors
  }
}

function formatCategory(cat?: BusCategory): string {
  switch (cat) {
    case 'SEMI':
      return 'Semi-Luxury';
    case 'LUXURY_AC':
      return 'Luxury AC';
    case 'EXPRESSWAY':
      return 'Expressway';
    case 'NORMAL':
    default:
      return 'Normal';
  }
}

async function dispatchNotification(payload: {
  title: string;
  body: string;
  tag: string;
  renotify: boolean;
  vibrate?: number[];
}): Promise<void> {
  const icon = '/pwa-192x192.png';
  const badge = '/pwa-192x192.png';

  const options: ExtendedNotificationOptions = {
    body: payload.body,
    tag: payload.tag,
    renotify: payload.renotify,
    icon,
    badge,
    vibrate: payload.vibrate,
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        payload.title,
        options as NotificationOptions
      );
    } catch {
      try {
        new Notification(payload.title, options as NotificationOptions);
      } catch (e) {
        console.error('Failed to dispatch service worker notification:', e);
      }
    }
  } else {
    try {
      new Notification(payload.title, options as NotificationOptions);
    } catch (e) {
      console.error('Failed to dispatch standard notification:', e);
    }
  }

  // Trigger device vibration if renotify is enabled
  if (payload.renotify && payload.vibrate && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(payload.vibrate);
    } catch {
      // Ignore vibration unsupported error
    }
  }
}

export function useTripAlerts(buses: TimetableEntry[], now: Date) {
  const [trackedTripIds, setTrackedTripIds] = useState<string[]>(() =>
    getStoredTrackedTrips()
  );

  // Set of alerted stage keys to avoid duplicate notifications within the same trip window
  const alertedStagesRef = useRef<Set<string>>(loadAlertedKeys());

  // Keep state synchronized with localStorage
  const updateTrackedTrips = useCallback((newIds: string[]) => {
    setTrackedTripIds(newIds);
    saveStoredTrackedTrips(newIds);
  }, []);

  const toggleTrackTrip = useCallback(
    async (busId: string) => {
      // If currently tracked, untrack
      if (trackedTripIds.includes(busId)) {
        const next = trackedTripIds.filter((id) => id !== busId);
        updateTrackedTrips(next);
        return;
      }

      // If untracked, request notification permission if not yet decided
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'default'
      ) {
        try {
          await Notification.requestPermission();
        } catch (err) {
          console.warn('Error requesting notification permission:', err);
        }
      }

      const next = [...trackedTripIds, busId];
      updateTrackedTrips(next);
    },
    [trackedTripIds, updateTrackedTrips]
  );

  const isTripTracked = useCallback(
    (busId: string) => trackedTripIds.includes(busId),
    [trackedTripIds]
  );

  /**
   * 5-Stage Departure Notification Alert Pipeline:
   * - Stage 1: Bus Parked (Bay Arrival) -> now >= scheduledParkingTime (and diffMinutes > 0)
   * - Stage 2: T-15 Minutes -> diffMinutes <= 15 && diffMinutes > 5
   * - Stage 3: T-5 Minutes -> diffMinutes <= 5 && diffMinutes > 3
   * - Stage 4: T-3 Minutes -> diffMinutes <= 3 && diffMinutes >= 1 (silent step-down per minute)
   * - Stage 5: Departed Alert -> diffMinutes <= 0 (first tick after scheduled departure)
   */
  const evaluateStages = useCallback(
    (currentTime: Date) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      if (trackedTripIds.length === 0 || buses.length === 0) return;

      for (const bus of buses) {
        if (!trackedTripIds.includes(bus.id)) continue;

        const departureDate = parseTimeToToday(
          bus.scheduledLeavingTime,
          currentTime
        );
        if (!departureDate) continue;

        const parkingDate = bus.scheduledParkingTime
          ? parseTimeToToday(bus.scheduledParkingTime, currentTime)
          : null;

        const diffMs = departureDate.getTime() - currentTime.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        const busNumber = bus.busNumber || `Route ${bus.routeNumber}`;
        const categoryLabel = formatCategory(bus.busCategory);

        // --- Stage 1: Bus Parked (Bay Arrival) ---
        if (
          parkingDate &&
          currentTime.getTime() >= parkingDate.getTime() &&
          diffMinutes > 0
        ) {
          const stage1Key = `${bus.id}_stage1_parked_${bus.scheduledLeavingTime}`;
          if (!alertedStagesRef.current.has(stage1Key)) {
            saveAlertedKey(alertedStagesRef.current, stage1Key);
            dispatchNotification({
              title: 'Bus Arrived at Bay · Colombo Central',
              body: `Bus ${busNumber} to ${bus.destination} is now parked and preparing for boarding.`,
              tag: `ybil-parked-${bus.id}`,
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        }

        // --- Stage 2: T-15 Minutes (Prep Warning) ---
        if (diffMinutes <= 15 && diffMinutes > 5) {
          const stage2Key = `${bus.id}_stage2_t15_${bus.scheduledLeavingTime}`;
          if (!alertedStagesRef.current.has(stage2Key)) {
            saveAlertedKey(alertedStagesRef.current, stage2Key);
            dispatchNotification({
              title: 'Trip Reminder · 15m Left',
              body: `Bus ${busNumber} (${categoryLabel}) departs in 15 minutes. Head towards the platform.`,
              tag: `ybil-t15-${bus.id}`,
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        }

        // --- Stage 3: T-5 Minutes (Boarding Alert) ---
        if (diffMinutes <= 5 && diffMinutes > 3) {
          const stage3Key = `${bus.id}_stage3_t5_${bus.scheduledLeavingTime}`;
          if (!alertedStagesRef.current.has(stage3Key)) {
            saveAlertedKey(alertedStagesRef.current, stage3Key);
            dispatchNotification({
              title: 'Boarding Now · Colombo Central',
              body: `Bus ${busNumber} to ${bus.destination} leaves in 5 minutes! Prepare to board.`,
              tag: `ybil-countdown-${bus.id}`,
              renotify: true,
              vibrate: [300, 150, 300],
            });
          }
        }

        // --- Stage 4: T-3 Minutes (Silent Minute Countdown Step-Down) ---
        if (diffMinutes <= 3 && diffMinutes >= 1) {
          const stage4Key = `${bus.id}_stage4_t${diffMinutes}m_${bus.scheduledLeavingTime}`;
          if (!alertedStagesRef.current.has(stage4Key)) {
            saveAlertedKey(alertedStagesRef.current, stage4Key);

            let bodyText = `Bus ${busNumber} departs in ${diffMinutes} minutes.`;
            if (diffMinutes === 1) {
              bodyText = `Bus ${busNumber} departs in 1 minute. Final call!`;
            }

            dispatchNotification({
              title: 'Boarding Now · Colombo Central',
              body: bodyText,
              tag: `ybil-countdown-${bus.id}`, // Matches Stage 3 tag to update existing card
              renotify: false, // Silently updates without repeated buzzing
            });
          }
        }

        // --- Stage 5: Departed Alert ---
        if (diffMinutes <= 0 && diffMinutes > -15) {
          const stage5Key = `${bus.id}_stage5_departed_${bus.scheduledLeavingTime}`;
          if (!alertedStagesRef.current.has(stage5Key)) {
            saveAlertedKey(alertedStagesRef.current, stage5Key);
            dispatchNotification({
              title: 'Bus Departed',
              body: `Bus ${busNumber} to ${bus.destination} has left the stand.`,
              tag: `ybil-departed-${bus.id}`,
              renotify: true,
              vibrate: [150, 100, 150],
            });
          }
        }
      }
    },
    [buses, trackedTripIds]
  );

  // Interval evaluation (30-second interval + reactive on live clock now updates)
  useEffect(() => {
    evaluateStages(now);

    const interval = setInterval(() => {
      evaluateStages(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [evaluateStages, now]);

  return {
    trackedTripIds,
    toggleTrackTrip,
    isTripTracked,
  };
}
