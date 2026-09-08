import React from "react";
import type { TimetableEntry, BusCategory } from "../types/transit";
import { getDepartureStatus } from "../utils/timeUtils";
import {
  Bus,
  Clock,
  Bookmark,
  Sparkles,
  Zap,
  Shield,
  Check,
  Bell,
  BellRing,
} from "lucide-react";

interface BusCardProps {
  bus: TimetableEntry;
  now: Date;
  onMarkTrip?: (busId: string) => void;
  isMarked?: boolean;
  onToggleTrack?: (busId: string) => void;
  isTracked?: boolean;
}

const CATEGORY_CONFIG: Record<
  BusCategory,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  NORMAL: {
    label: "Normal",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60",
  },
  SEMI: {
    label: "Semi-Lux",
    className:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60",
    icon: <Zap className="h-2.5 w-2.5" />,
  },
  LUXURY_AC: {
    label: "A/C Luxury",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/60",
    icon: <Sparkles className="h-2.5 w-2.5" />,
  },
  EXPRESSWAY: {
    label: "Expressway",
    className:
      "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60",
    icon: <Shield className="h-2.5 w-2.5" />,
  },
};

export const BusCard: React.FC<BusCardProps> = ({
  bus,
  now,
  onMarkTrip,
  isMarked = false,
  onToggleTrack,
  isTracked = false,
}) => {
  const status = getDepartureStatus(bus.scheduledLeavingTime, now);
  const categoryConfig =
    CATEGORY_CONFIG[bus.busCategory ?? "NORMAL"] || CATEGORY_CONFIG.NORMAL;
  const isSltb = bus.operatorType === "SLTB";

  const handleMark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMarked && !status.hasDeparted && onMarkTrip) {
      onMarkTrip(bus.id);
    }
  };

  const handleTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleTrack) {
      onToggleTrack(bus.id);
    }
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
        isMarked
          ? "border-blue-500 bg-blue-50/60 dark:border-cyan-500/70 dark:bg-cyan-950/20 ring-2 ring-blue-500/20 dark:ring-cyan-500/20"
          : status.hasDeparted
            ? "border-[#dce5e8]/80 bg-[#f4f7f7]/70 opacity-60 dark:border-[#334155]/60 dark:bg-[#162026]/50"
            : "border-[#dce5e8] bg-white hover:border-slate-300 dark:border-[#334155] dark:bg-[#162026] dark:hover:border-slate-600"
      }`}
    >
      {/* Left Operator Accent Stripe (SLTB Red / Private Gold) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
          isSltb ? "bg-[#e94b50]" : "bg-[#ead57b]"
        }`}
      />

      <div className="p-4 pl-4.5 sm:pl-5">
        {/* Card Header: Badges & Departure Time */}
        <div className="flex items-start justify-between gap-3">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Route badge */}
            <span className="rounded-lg bg-[#17232c] px-2 py-0.5 text-xs font-bold text-white shadow-xs dark:bg-slate-800 dark:text-cyan-300">
              Route {bus.routeNumber}
            </span>

            {/* Operator pill */}
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                isSltb
                  ? "bg-[#e94b50]/10 text-[#e94b50] border-[#e94b50]/30 dark:bg-[#e94b50]/20 dark:text-[#f87171] dark:border-[#e94b50]/40"
                  : "bg-[#ead57b]/20 text-[#856804] border-[#ead57b]/40 dark:bg-[#ead57b]/15 dark:text-[#ead57b] dark:border-[#ead57b]/30"
              }`}
            >
              {bus.operatorType}
            </span>

            {/* Classification badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${categoryConfig.className}`}
            >
              {categoryConfig.icon}
              <span>{categoryConfig.label}</span>
            </span>
          </div>

          {/* Departure Time in Space Grotesk */}
          <div className="text-right shrink-0">
            <span className="font-display text-2xl font-bold tracking-tight text-[#17232c] dark:text-white leading-none">
              {bus.scheduledLeavingTime}
            </span>
          </div>
        </div>

        {/* Card Mid: Vector Bus Icon + Trajectory + Dynamic Arrival Pill */}
        <div className="mt-3.5 flex items-center justify-between gap-3">
          {/* Trajectory */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Small Bus Vector Thumbnail */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSltb
                  ? "bg-[#e94b50]/10 text-[#e94b50] dark:bg-[#e94b50]/20 dark:text-[#f87171]"
                  : "bg-[#ead57b]/25 text-[#967705] dark:bg-[#ead57b]/20 dark:text-[#ead57b]"
              }`}
            >
              <Bus className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-[#75838c] dark:text-[#94a3b8] truncate">
                {bus.origin || "Colombo Central"}
              </p>
              <p className="text-sm font-bold text-[#17232c] dark:text-white truncate">
                → {bus.destination}
              </p>
            </div>
          </div>

          {/* Dynamic Arrival Countdown Pill */}
          <div className="shrink-0 text-right">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                status.hasDeparted
                  ? "bg-slate-100 text-[#75838c] border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700 opacity-70"
                  : status.isImminent
                    ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-600 animate-pulse shadow-xs"
                    : status.diffMinutes <= 60
                      ? "bg-[#e9f8f3] text-[#25856f] border-[#25856f]/30 dark:bg-[#25856f]/20 dark:text-[#37be96] dark:border-[#37be96]/40"
                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Clock className="h-3 w-3 shrink-0" />
              <span>{status.label}</span>
            </span>
          </div>
        </div>

        {/* Card Footer: Stand Bay Info + Actions (Track Alert & Mark Bus) */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#dce5e8] pt-2.5 text-xs text-[#75838c] dark:border-[#334155] dark:text-[#94a3b8]">
          <div className="flex items-center gap-1.5 font-medium">
            <span>
              Stands{" "}
              <strong className="font-semibold text-[#17232c] dark:text-slate-200">
                {bus.scheduledParkingTime}
              </strong>
            </span>
            {bus.busNumber && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-mono text-[11px] text-[#75838c] dark:text-[#94a3b8]">
                  {bus.busNumber}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bell / Track Departure Alert Button */}
            {onToggleTrack && (
              <button
                type="button"
                onClick={handleTrack}
                title={
                  isTracked ? "Stop Departure Alerts" : "Track Departure Alert"
                }
                aria-label={
                  isTracked ? "Stop Departure Alerts" : "Track Departure Alert"
                }
                className={`inline-flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150 relative before:absolute before:-inset-1 before:content-[''] active:scale-95 ${
                  isTracked
                    ? "bg-amber-500 text-white shadow-xs dark:bg-amber-400 dark:text-slate-950 ring-2 ring-amber-400/30"
                    : "bg-[#f4f7f7] text-[#75838c] border border-[#dce5e8] hover:text-[#17232c] hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-[#334155] dark:hover:text-white"
                }`}
              >
                {isTracked ? (
                  <BellRing className="h-3.5 w-3.5" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            {/* Mark Bus Button */}
            {onMarkTrip && (
              <button
                type="button"
                onClick={handleMark}
                disabled={isMarked || status.hasDeparted}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                  isMarked
                    ? "bg-blue-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950 cursor-default"
                    : status.hasDeparted
                      ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-600 dark:border-slate-800 cursor-not-allowed"
                      : "bg-[#f4f7f7] text-[#17232c] border border-[#dce5e8] hover:bg-slate-200 hover:text-black dark:bg-slate-800 dark:text-slate-100 dark:border-[#334155] dark:hover:bg-slate-700"
                }`}
              >
                {isMarked ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Mark Bus</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
