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
        busCategory: entry.busCategory ?? "NORMAL",
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
  const isSltb = resolvedEntry?.operatorType === "SLTB";

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
      <div className="mb-6 rounded-2xl border border-[#dce5e8] bg-white dark:border-[#334155] dark:bg-[#162026] p-4 text-xs text-[#75838c] dark:text-[#94a3b8] animate-pulse">
        Loading active trip details...
      </div>
    );
  }

  return (
    <section
      id="active-trip-shelf"
      aria-label="Active Marked Trip"
      className="relative mb-6 overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 p-4.5 shadow-md dark:border-cyan-500/40 dark:bg-gradient-to-br dark:from-[#162026] dark:via-[#1a2b36] dark:to-[#162026] dark:shadow-xl transition-all"
    >
      {/* Accent stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isSltb ? "bg-[#e94b50]" : "bg-[#ead57b]"
        }`}
      />

      <div className="pl-2 sm:pl-3">
        {/* Shelf Header */}
        <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-400">
              Active Marked Bus
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnmark(activeTrip.id);
            }}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold text-[#75838c] transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Unmark</span>
          </button>
        </div>

        {/* Shelf Content: Route & Departure */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg bg-[#17232c] px-2 py-0.5 text-xs font-bold text-white dark:bg-slate-800 dark:text-cyan-300">
                Route {resolvedEntry.routeNumber}
              </span>
              <span
                className={`rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                  isSltb
                    ? "bg-[#e94b50]/10 text-[#e94b50] border-[#e94b50]/30 dark:bg-[#e94b50]/20 dark:text-[#f87171]"
                    : "bg-[#ead57b]/25 text-[#856804] border-[#ead57b]/40 dark:bg-[#ead57b]/15 dark:text-[#ead57b]"
                }`}
              >
                {resolvedEntry.operatorType}
              </span>
              {resolvedEntry.busNumber && (
                <span className="font-mono text-xs text-[#75838c] dark:text-[#94a3b8]">
                  {resolvedEntry.busNumber}
                </span>
              )}
            </div>

            <p className="mt-2 text-base font-extrabold text-[#17232c] dark:text-white">
              {resolvedEntry.origin} → {resolvedEntry.destination}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#75838c] dark:text-[#94a3b8]">
              Bay Stands at{" "}
              <strong className="text-[#17232c] dark:text-slate-200">
                {resolvedEntry.scheduledParkingTime}
              </strong>
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="font-display text-2xl font-black tracking-tight text-[#17232c] dark:text-white leading-none">
              {scheduledLeaving}
            </div>
            <div
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                status.hasDeparted
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-400"
                  : status.isUrgent
                    ? "animate-pulse border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                    : "border-[#25856f]/30 bg-[#e9f8f3] text-[#25856f] dark:border-[#37be96]/40 dark:bg-[#25856f]/20 dark:text-[#37be96]"
              }`}
            >
              <Clock className="h-3 w-3 shrink-0" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Departed Alternatives Drawer */}
        {status.hasDeparted && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 dark:border-amber-800/60 dark:bg-amber-950/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>This bus has departed! Next options on this route:</span>
            </div>

            <div className="mt-2.5 space-y-2">
              {alternatives.length === 0 ? (
                <p className="text-xs text-[#75838c] italic dark:text-slate-400">
                  No later buses scheduled today on this route.
                </p>
              ) : (
                alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between rounded-xl border border-[#dce5e8] bg-white px-3 py-2 text-xs shadow-xs dark:border-[#334155] dark:bg-[#162026]"
                  >
                    <div className="flex items-center gap-2">
                      <Bus className="h-3.5 w-3.5 text-[#75838c] dark:text-[#94a3b8]" />
                      <span className="font-display font-bold text-sm text-[#17232c] dark:text-white">
                        {alt.scheduledLeavingTime}
                      </span>
                      <span className="text-[#75838c] dark:text-[#94a3b8]">
                        ({alt.operatorType})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchTrip(alt.id);
                      }}
                      className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
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
    </section>
  );
};
