import React from 'react';
import type { TimetableEntry } from '../types/transit';
import { getDepartureStatus } from '../utils/timeUtils';
import { Bus, Clock, Bookmark } from 'lucide-react';

interface BusCardProps {
  bus: TimetableEntry;
  onMarkTrip?: (busId: string) => void;
  isMarked?: boolean;
}

export const BusCard: React.FC<BusCardProps> = ({ bus, onMarkTrip, isMarked = false }) => {
  const status = getDepartureStatus(bus.scheduledLeavingTime);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700">
      {/* Operator Accent Strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          bus.operatorType === 'SLTB' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      />

      <div className="flex items-start justify-between gap-3 pl-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-100">
              Route {bus.routeNumber}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider ${
                bus.operatorType === 'SLTB'
                  ? 'bg-red-950/70 text-red-400 border border-red-800/60'
                  : 'bg-blue-950/70 text-blue-400 border border-blue-800/60'
              }`}
            >
              {bus.operatorType}
            </span>
            {bus.busNumber && (
              <span className="text-xs text-slate-400 font-mono">{bus.busNumber}</span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium text-slate-200">
            {bus.origin} → <span className="text-white font-semibold">{bus.destination}</span>
          </p>
        </div>

        {/* Departure Time & Countdown Badge */}
        <div className="text-right shrink-0">
          <div className="text-base font-bold tracking-tight text-slate-100">
            {bus.scheduledLeavingTime}
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              status.hasDeparted
                ? 'bg-slate-800 text-slate-400'
                : status.isUrgent
                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 pl-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Bus className="h-3.5 w-3.5 text-slate-500" />
          Stands from: <strong className="text-slate-300">{bus.scheduledParkingTime}</strong>
        </span>

        {onMarkTrip && (
          <button
            onClick={() => onMarkTrip(bus.id)}
            disabled={isMarked || status.hasDeparted}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              isMarked
                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${isMarked ? 'fill-blue-400 text-blue-400' : ''}`} />
            {isMarked ? 'Marked' : 'Mark Bus'}
          </button>
        )}
      </div>
    </div>
  );
};