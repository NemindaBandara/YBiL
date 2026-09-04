import React, { useState, useEffect } from 'react';
import type { MarkedTrip, TimetableEntry } from '../types/transit';
import { timetableRepository } from '../db/timetableRepository';
import { getDepartureStatus } from '../utils/timeUtils';
import { Bus, Clock, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

interface ActiveTripShelfProps {
  activeTrip: MarkedTrip;
  now: Date;
  onUnmark: (tripId: string) => void;
  onSwitchTrip: (newEntryId: string) => void;
}

export const ActiveTripShelf: React.FC<ActiveTripShelfProps> = ({
  activeTrip,
  now,
  onUnmark,
  onSwitchTrip,
}) => {
  const [resolvedEntry, setResolvedEntry] = useState<TimetableEntry | null>(null);
  const [alternatives, setAlternatives] = useState<TimetableEntry[]>([]);

  // Always resolve timetable entry from Dexie cache if nested data is missing
  useEffect(() => {
    const entry = activeTrip.timetableEntry;
    if (entry && entry.route) {
      setResolvedEntry({
        id: entry.id,
        routeId: entry.route.id,
        routeNumber: entry.route.routeNumber,
        origin: entry.route.origin,
        destination: entry.route.destination,
        operatorType: entry.operatorType,
        busNumber: entry.busNumber,
        scheduledParkingTime: entry.scheduledParkingTime,
        scheduledLeavingTime: entry.scheduledLeavingTime,
        updatedAt: entry.updatedAt,
      });
    } else {
      const entryId = (entry as unknown as { id?: string })?.id || activeTrip.timetableEntry?.id;
      if (entryId) {
        timetableRepository.getAllEntries().then((entries) => {
          const match = entries.find((e) => e.id === entryId);
          if (match) setResolvedEntry(match);
        });
      }
    }
  }, [activeTrip]);

  const scheduledLeaving = resolvedEntry?.scheduledLeavingTime || '00:00';
  const status = getDepartureStatus(scheduledLeaving, now);

  useEffect(() => {
    if (status.hasDeparted && resolvedEntry?.routeId) {
      timetableRepository
        .getNextAlternatives(resolvedEntry.routeId, scheduledLeaving)
        .then((items) => setAlternatives(items.slice(0, 3)));
    } else {
      setAlternatives([]);
    }
  }, [status.hasDeparted, resolvedEntry?.routeId, scheduledLeaving]);

  if (!resolvedEntry) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-400 animate-pulse">
        Loading active trip details...
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Active Marked Bus
          </h2>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnmark(activeTrip.id);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
            Route {resolvedEntry.routeNumber}
          </span>
          <p className="mt-1.5 text-base font-bold text-slate-100">
            {resolvedEntry.origin} → {resolvedEntry.destination}
          </p>
          <p className="text-xs text-slate-400">
            {resolvedEntry.operatorType} {resolvedEntry.busNumber ? `• ${resolvedEntry.busNumber}` : ''}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-white">
            {scheduledLeaving}
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              status.hasDeparted
                ? 'border border-red-800 bg-red-950 text-red-400'
                : status.isUrgent
                ? 'animate-pulse border border-amber-800 bg-amber-950 text-amber-300'
                : 'border border-emerald-800/50 bg-emerald-950 text-emerald-400'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {status.hasDeparted && (
        <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/40 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This bus has departed! Next options on this route:</span>
          </div>

          <div className="mt-2.5 space-y-2">
            {alternatives.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No later buses scheduled today on this route.</p>
            ) : (
              alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Bus className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-200">{alt.scheduledLeavingTime}</span>
                    <span className="text-slate-400">({alt.operatorType})</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwitchTrip(alt.id);
                    }}
                    className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <span>Mark this instead</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};