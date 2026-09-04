import React, { useState, useEffect } from "react";
import type { MarkedTrip, TimetableEntry } from "../types/transit";
import { timetableRepository } from "../db/timetableRepository";
import { getDepartureStatus } from "../utils/timeUtils";
import { Bus, Clock, AlertTriangle, ArrowRight, Trash2 } from "lucide-react";

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
  const [resolvedEntry, setResolvedEntry] = useState<TimetableEntry | null>(
    null,
  );
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
      const entryId =
        (entry as unknown as { id?: string })?.id ||
        activeTrip.timetableEntry?.id;
      if (entryId) {
        timetableRepository.getAllEntries().then((entries) => {
          const match = entries.find((e) => e.id === entryId);
          if (match) setResolvedEntry(match);
        });
      }
    }
  }, [activeTrip]);

  const scheduledLeaving = resolvedEntry?.scheduledLeavingTime || "00:00";
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
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 text-xs text-slate-500 dark:text-slate-400 animate-pulse">
        Loading active trip details...
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-blue-400/50 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 shadow-md dark:border-blue-500/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 dark:shadow-xl p-4 transition-colors">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Active Marked Bus
          </h2>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnmark(activeTrip.id);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400"
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
          <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-100">
            {resolvedEntry.origin} → {resolvedEntry.destination}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {resolvedEntry.operatorType}{" "}
            {resolvedEntry.busNumber ? `• ${resolvedEntry.busNumber}` : ""}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {scheduledLeaving}
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              status.hasDeparted
                ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                : status.isUrgent
                  ? "animate-pulse border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950 dark:text-emerald-400"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {status.hasDeparted && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/80 p-3 dark:border-amber-800/60 dark:bg-amber-950/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This bus has departed! Next options on this route:</span>
          </div>

          <div className="mt-2.5 space-y-2">
            {alternatives.length === 0 ? (
              <p className="text-xs text-slate-500 italic dark:text-slate-400">
                No later buses scheduled today on this route.
              </p>
            ) : (
              alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <Bus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {alt.scheduledLeavingTime}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ({alt.operatorType})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwitchTrip(alt.id);
                    }}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
