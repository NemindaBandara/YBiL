import React from 'react';
import type { TimetableEntry, BusCategory } from '../types/transit';
import { getDepartureStatus } from '../utils/timeUtils';
import { Bus, Clock, Bookmark, Sparkles, Zap, Shield } from 'lucide-react';

interface BusCardProps {
  bus: TimetableEntry;
  now: Date;
  onMarkTrip?: (busId: string) => void;
  isMarked?: boolean;
}

const CATEGORY_CONFIG: Record<
  BusCategory,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  NORMAL: {
    label: 'Normal',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
  },
  SEMI: {
    label: 'Semi-Exp',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60',
    icon: <Zap className="h-2.5 w-2.5" />,
  },
  LUXURY_AC: {
    label: 'A/C Luxury',
    className:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/60',
    icon: <Sparkles className="h-2.5 w-2.5" />,
  },
  EXPRESSWAY: {
    label: 'Expressway',
    className:
      'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
    icon: <Shield className="h-2.5 w-2.5" />,
  },
};

export const BusCard: React.FC<BusCardProps> = ({ bus, now, onMarkTrip, isMarked = false }) => {
  const status = getDepartureStatus(bus.scheduledLeavingTime, now);
  const categoryConfig = CATEGORY_CONFIG[bus.busCategory ?? 'NORMAL'] || CATEGORY_CONFIG.NORMAL;

  const handleMark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMarked && !status.hasDeparted && onMarkTrip) {
      onMarkTrip(bus.id);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-colors ${
        isMarked
          ? 'border-blue-500 bg-blue-50/70 dark:border-blue-500/60 dark:bg-blue-950/20'
          : status.hasDeparted
          ? 'border-slate-200/80 bg-slate-100/60 opacity-50 dark:border-slate-800/40 dark:bg-slate-900/40'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700'
      }`}
    >
      {/* Operator accent indicator line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          bus.operatorType === 'SLTB' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      />

      <div className="flex items-start justify-between gap-3 pl-1">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              Route {bus.routeNumber}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider ${
                bus.operatorType === 'SLTB'
                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/70 dark:text-red-400 dark:border-red-800/60'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-400 dark:border-blue-800/60'
              }`}
            >
              {bus.operatorType}
            </span>

            {/* Bus Service Category Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${categoryConfig.className}`}
            >
              {categoryConfig.icon}
              <span>{categoryConfig.label}</span>
            </span>

            {bus.busNumber && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {bus.busNumber}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            {bus.origin} → <span className="font-semibold text-slate-900 dark:text-white">{bus.destination}</span>
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {bus.scheduledLeavingTime}
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              status.hasDeparted
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                : status.isUrgent
                ? 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800/50'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 pl-1 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Bus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          Stands: <strong className="text-slate-700 dark:text-slate-300">{bus.scheduledParkingTime}</strong>
        </span>

        {onMarkTrip && (
          <button
            type="button"
            onClick={handleMark}
            disabled={isMarked || status.hasDeparted}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              isMarked
                ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700'
                : status.hasDeparted
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${isMarked ? 'fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400' : ''}`} />
            {isMarked ? 'Marked' : 'Mark Bus'}
          </button>
        )}
      </div>
    </div>
  );
};