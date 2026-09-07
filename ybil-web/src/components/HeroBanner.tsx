import React from "react";
import { BusIllustration } from "./BusIllustration";

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
  const nextValue = nextDepartureTime || nextDepartureCountdown || "--:--";

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 bg-[#1e262c] border border-slate-700/40 text-white shadow-xl">
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-blue-600/5 blur-2xl" />

      {/* Header & Copy */}
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-wider text-[#6f8595] uppercase">
          LIVE DEPARTURE BOARD
        </p>

        <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
          Move smarter.<br></br> <span className="text-cyan-300">Catch your bus.</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mt-1.5 mb-1.5 sm:mb-6">
          Clear routes, bus types and live departure times — designed for a
          quick glance.
        </p>
      </div>

      {/* Bottom Section Alignment (Side-by-Side) */}
      <div className="relative z-10 flex items-end justify-between gap-2 sm:gap-4">
        {/* Left Side: Stats Group (compact sleek badges) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Tile 1: Today */}
          <div className="bg-[#28323a]/70 rounded-md sm:rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 min-w-[38px] sm:min-w-[46px] text-center border border-white/5 shadow-sm">
            <div className="text-xs sm:text-sm md:text-base font-bold text-white font-display leading-tight">
              {totalBusesToday}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 tracking-wide">
              today
            </div>
          </div>

          {/* Tile 2: Next */}
          <div className="bg-[#28323a]/70 rounded-md sm:rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 min-w-[38px] sm:min-w-[46px] text-center border border-white/5 shadow-sm">
            <div className="text-xs sm:text-sm md:text-base font-bold text-white font-display leading-tight">
              {nextValue}
            </div>
            <div className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 tracking-wide">
              next
            </div>
          </div>

          {/* Tile 3: Routes */}
          <div className="bg-[#28323a]/70 rounded-md sm:rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 min-w-[38px] sm:min-w-[46px] text-center border border-white/5 shadow-sm">
            <div className="text-xs sm:text-sm md:text-base font-bold text-white font-display leading-tight">
              {totalActiveRoutes}
            </div>
            <div className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 tracking-wide">
              routes
            </div>
          </div>
        </div>

        {/* Right Side: Bus Graphic (larger, sitting level along bottom baseline) */}
        <div className="flex-1 flex justify-end items-end min-w-0">
          <BusIllustration
            operatorType={selectedOperator}
            className="w-36 h-18 xs:w-40 xs:h-20 sm:w-48 sm:h-24 md:w-56 md:h-28 shrink-0 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};
