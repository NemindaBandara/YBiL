import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimetableEntry } from '../types/transit';
import { getDepartureStatus } from '../utils/timeUtils';

const STORAGE_KEY = 'trackedTrips';

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

export function useTripAlerts(buses: TimetableEntry[], now: Date) {
  const [trackedTripIds, setTrackedTripIds] = useState<string[]>(() =>
    getStoredTrackedTrips()
  );

  // Set of alerted keys ("busId_time") to avoid duplicate notifications within the same trip window
  const alertedTripsRef = useRef<Set<string>>(new Set());

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

  // Check tracked trips against current time
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (trackedTripIds.length === 0 || buses.length === 0) return;

    for (const bus of buses) {
      if (!trackedTripIds.includes(bus.id)) continue;

      const status = getDepartureStatus(bus.scheduledLeavingTime, now);
      // Trigger when 10 minutes or fewer remain until departure (and hasn't departed yet)
      if (status.diffMinutes <= 10 && status.diffMinutes >= 0) {
        const alertKey = `${bus.id}_${bus.scheduledLeavingTime}`;
        if (!alertedTripsRef.current.has(alertKey)) {
          alertedTripsRef.current.add(alertKey);

          const busIdentifier = bus.busNumber || `Route ${bus.routeNumber}`;
          const alertTitle = 'YBiL Alert';
          const alertBody = `Bus ${busIdentifier} to ${bus.destination} departs in 10 minutes from Central Bus Stand!`;
          const alertIcon = '/pwa-192x192.png';

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready
              .then((registration) => {
                registration.showNotification(alertTitle, {
                  body: alertBody,
                  icon: alertIcon,
                  badge: alertIcon,
                  tag: `ybil-departure-${bus.id}`,
                });
              })
              .catch(() => {
                try {
                  new Notification(alertTitle, {
                    body: alertBody,
                    icon: alertIcon,
                  });
                } catch (e) {
                  console.error('Failed to dispatch notification:', e);
                }
              });
          } else {
            try {
              new Notification(alertTitle, {
                body: alertBody,
                icon: alertIcon,
              });
            } catch (e) {
              console.error('Failed to dispatch notification:', e);
            }
          }

          if (typeof navigator.vibrate === 'function') {
            navigator.vibrate([200, 100, 200]);
          }
        }
      }
    }
  }, [buses, now, trackedTripIds]);

  return {
    trackedTripIds,
    toggleTrackTrip,
    isTripTracked,
  };
}
