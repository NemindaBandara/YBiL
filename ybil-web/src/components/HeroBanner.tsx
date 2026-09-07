import React from "react";
import { BusIllustration } from "./BusIllustration";
import { Bus, Clock, MapPin } from "lucide-react";

interface HeroBannerProps {
  totalBusesToday: number;
  nextDepartureCountdown: string | null;
  nextDepartureTime: string | null;
  totalActiveRoutes: number;
  selectedOperator: "ALL" | "SLTB" | "PRIVATE";
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalBusesToday,
  nextDepartureCountdown,
  nextDepartureTime,
  totalActiveRoutes,
  selectedOperator,
}) => {
  return (
    <div
      className="relative mb-6 overflow-hidden rounded-3xl p-5 md:p-6 shadow-xl border border-slate-700/50 text-white transition-all duration-300"
      style={{
        background: "linear-gradient(145deg, #17232c 0%, #304650 100%)",
      }}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-blue-600/10 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Kicker & Headline */}
        <div className="flex-1">
          {/* Kicker with live beacon */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            LIVE DEPARTURE BOARD
          </div>

          {/* Headline in Space Grotesk */}
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Move smarter. <span className="text-cyan-300">Catch your bus.</span>
          </h2>
          <p className="mt-1 text-xs text-slate-300 max-w-sm">
            Real-time Colombo Central Bus Stand departures, automated bay
            tracking, and instant alerts.
          </p>
        </div>

        {/* Right: Dynamic Stylized Bus Illustration */}
        <div className="flex items-center justify-end shrink-0 -my-2 md:my-0">
          <BusIllustration operatorType={selectedOperator} />
        </div>
      </div>

      {/* Bottom: 3 Live Stats Pills */}
      <div className="relative z-10 mt-5 grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10">
        {/* Pill 1: Total Buses Today */}
        <div className="flex flex-col rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <Bus className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
            <span className="truncate">Total Today</span>
          </div>
          <div className="mt-1 font-display text-lg md:text-xl font-bold tracking-tight text-white">
            {totalBusesToday}
          </div>
          <span className="text-[10px] text-slate-400">buses scheduled</span>
        </div>

        {/* Pill 2: Next Departure */}
        <div className="flex flex-col rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <Clock className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Next Departure</span>
          </div>
          <div className="mt-1 font-display text-lg md:text-xl font-bold tracking-tight text-white truncate">
            {nextDepartureCountdown || nextDepartureTime || "--:--"}
          </div>
          <span className="text-[10px] text-slate-400 truncate">
            {nextDepartureTime
              ? `Departs ${nextDepartureTime}`
              : "No upcoming buses"}
          </span>
        </div>

        {/* Pill 3: Active Routes */}
        <div className="flex flex-col rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">Active Routes</span>
          </div>
          <div className="mt-1 font-display text-lg md:text-xl font-bold tracking-tight text-white">
            {totalActiveRoutes}
          </div>
          <span className="text-[10px] text-slate-400">destinations</span>
        </div>
      </div>
    </div>
  );
};
