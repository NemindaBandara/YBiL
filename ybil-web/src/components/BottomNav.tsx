import React from "react";
import { Bus, Bookmark, MapPin, User } from "lucide-react";

export type NavTab = "departures" | "saved" | "routes" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveTrip: boolean;
  isAuthenticated: boolean;
  username?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveTrip,
  isAuthenticated,
  username,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-[67px] backdrop-blur-md bg-white/85 dark:bg-[#162026]/85 border-t border-[#dce5e8] dark:border-[#334155] transition-colors"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex h-full max-w-2xl items-center justify-around px-4">
        {/* Departures */}
        <button
          type="button"
          onClick={() => onTabChange("departures")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === "departures"
              ? "text-blue-600 dark:text-cyan-400 font-bold"
              : "text-[#75838c] dark:text-[#94a3b8] hover:text-[#17232c] dark:hover:text-white font-medium"
          }`}
        >
          <Bus className="h-5 w-5" />
          <span className="text-[11px] tracking-tight">Departures</span>
        </button>

        {/* Saved / Active Trip */}
        <button
          type="button"
          onClick={() => onTabChange("saved")}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === "saved"
              ? "text-blue-600 dark:text-cyan-400 font-bold"
              : "text-[#75838c] dark:text-[#94a3b8] hover:text-[#17232c] dark:hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <Bookmark
              className={`h-5 w-5 ${hasActiveTrip ? "fill-blue-500/20 dark:fill-cyan-400/20" : ""}`}
            />
            {hasActiveTrip && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Saved</span>
        </button>

        {/* Routes */}
        <button
          type="button"
          onClick={() => onTabChange("routes")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === "routes"
              ? "text-blue-600 dark:text-cyan-400 font-bold"
              : "text-[#75838c] dark:text-[#94a3b8] hover:text-[#17232c] dark:hover:text-white font-medium"
          }`}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-[11px] tracking-tight">Routes</span>
        </button>

        {/* Profile / Auth */}
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === "profile"
              ? "text-blue-600 dark:text-cyan-400 font-bold"
              : "text-[#75838c] dark:text-[#94a3b8] hover:text-[#17232c] dark:hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <User className="h-5 w-5" />
            {isAuthenticated && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[11px] tracking-tight truncate max-w-[60px]">
            {isAuthenticated && username ? username : "Profile"}
          </span>
        </button>
      </div>
    </nav>
  );
};
