import { useState, useEffect, useMemo, useCallback } from "react";
import { useSync } from "./hooks/useSync";
import { useAuth } from "./context/AuthContext";
import { useLiveClock } from "./hooks/useLiveClock";
import { apiClient } from "./api/client";
import { timetableRepository } from "./db/timetableRepository";
import type { TimetableEntry, MarkedTrip, BusCategory } from "./types/transit";
import { getDepartureStatus } from "./utils/timeUtils";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { BusCard } from "./components/BusCard";
import { ActiveTripShelf } from "./components/ActiveTripShelf";
import { AuthModal } from "./components/AuthModal";
import { BottomNav, type NavTab } from "./components/BottomNav";
import { AccountPage } from "./components/AccountPage";
import { Search, Eye, EyeOff } from "lucide-react";

export default function App() {
  const now = useLiveClock(15000);
  const { isSyncing, isOnline, lastSyncTime, triggerSync } = useSync();
  const { isAuthenticated, user } = useAuth();

  const [buses, setBuses] = useState<TimetableEntry[]>([]);
  const [activeTrip, setActiveTrip] = useState<MarkedTrip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<
    "ALL" | "SLTB" | "PRIVATE"
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | BusCategory>(
    "ALL",
  );
  const [showDeparted, setShowDeparted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("departures");

  const loadCachedTimetable = useCallback(async () => {
    const list = await timetableRepository.getAllEntries();
    setBuses(list);
  }, []);

  const handleSync = async () => {
    await triggerSync();
    await loadCachedTimetable();
  };

  const loadActiveTrip = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setActiveTrip(null);
      return;
    }
    try {
      const response = await apiClient<MarkedTrip | MarkedTrip[] | null>(
        "/api/trips/active",
      );

      if (Array.isArray(response)) {
        if (response.length === 0) {
          setActiveTrip(null);
          return;
        }
        const sorted = [...response].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setActiveTrip(sorted[0] || null);
      } else if (response && response.id) {
        setActiveTrip(response);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.warn("Could not load active trip:", err);
      setActiveTrip(null);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadCachedTimetable();
  }, [lastSyncTime, loadCachedTimetable]);

  useEffect(() => {
    loadActiveTrip();
  }, [loadActiveTrip]);

  const handleMarkTrip = async (timetableEntryId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const newTrip = await apiClient<MarkedTrip>("/api/trips/mark", {
        method: "POST",
        body: JSON.stringify({ timetableEntryId }),
      });
      if (newTrip && newTrip.id) {
        setActiveTrip(newTrip);
      }
    } catch (err) {
      console.error("Failed to mark trip:", err);
    }
  };

  const handleUnmarkTrip = async (tripId: string) => {
    try {
      await apiClient(`/api/trips/${tripId}`, { method: "DELETE" });
      setActiveTrip(null);
    } catch (err) {
      console.error("Failed to unmark trip:", err);
    }
  };

  const handleSwitchTrip = async (newEntryId: string) => {
    await handleMarkTrip(newEntryId);
  };

  const activeTripEntryId = useMemo(() => {
    if (!activeTrip) return null;
    return activeTrip.timetableEntry?.id ?? null;
  }, [activeTrip]);

  // Compute live hero statistics
  const totalBusesToday = buses.length;

  const totalActiveRoutes = useMemo(() => {
    const routeSet = new Set(buses.map((b) => b.routeNumber || b.routeId));
    return routeSet.size;
  }, [buses]);

  const nextUpcomingDeparture = useMemo(() => {
    const upcoming = buses
      .filter((b) => {
        const st = getDepartureStatus(b.scheduledLeavingTime, now);
        return !st.hasDeparted;
      })
      .sort((a, b) =>
        a.scheduledLeavingTime.localeCompare(b.scheduledLeavingTime),
      );

    if (upcoming.length === 0) return null;
    const earliest = upcoming[0];
    const st = getDepartureStatus(earliest.scheduledLeavingTime, now);
    return {
      time: earliest.scheduledLeavingTime,
      countdown: st.label,
    };
  }, [buses, now]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const status = getDepartureStatus(bus.scheduledLeavingTime, now);

      if (!showDeparted && status.shouldHide) {
        return false;
      }

      const matchesSearch =
        bus.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOperator =
        selectedOperator === "ALL" || bus.operatorType === selectedOperator;

      const matchesCategory =
        selectedCategory === "ALL" ||
        (bus.busCategory ?? "NORMAL") === selectedCategory;

      return matchesSearch && matchesOperator && matchesCategory;
    });
  }, [
    buses,
    searchQuery,
    selectedOperator,
    selectedCategory,
    showDeparted,
    now,
  ]);

  const navigateToAccount = useCallback(() => {
    if (window.location.pathname !== "/account") {
      window.history.pushState(null, "", "/account");
    }
    setActiveTab("account");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateToDepartures = useCallback(() => {
    if (window.location.pathname === "/account") {
      window.history.pushState(null, "", "/");
    }
    setActiveTab("departures");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackFromAccount = useCallback(() => {
    if (window.history.length > 1 && window.location.pathname === "/account") {
      window.history.back();
    } else {
      navigateToDepartures();
    }
  }, [navigateToDepartures]);

  useEffect(() => {
    if (window.location.pathname === "/account") {
      setActiveTab("account");
    }

    const handlePopState = () => {
      if (window.location.pathname === "/account") {
        setActiveTab("account");
      } else {
        setActiveTab("departures");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    if (tab === "account" || tab === "profile") {
      navigateToAccount();
      return;
    }

    if (activeTab === "account" || activeTab === "profile") {
      if (window.location.pathname === "/account") {
        window.history.pushState(null, "", "/");
      }
    }

    setActiveTab(tab);
    if (tab === "departures") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "saved") {
      const shelfElement = document.getElementById("active-trip-shelf");
      if (shelfElement) {
        shelfElement.scrollIntoView({ behavior: "smooth" });
      } else if (!isAuthenticated) {
        setIsAuthModalOpen(true);
      }
    } else if (tab === "routes") {
      const filterElement = document.getElementById("search-toolbar");
      if (filterElement) {
        filterElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-[#17232c] dark:bg-[#0f172a] dark:text-[#f8fafc] flex flex-col transition-colors">
    <div className="min-h-screen bg-[#f4f7f7] text-[#17232c] dark:bg-[#0f172a] dark:text-[#f8fafc] flex flex-col transition-colors overscroll-none touch-pan-y">
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={handleSync}
        onOpenAccount={navigateToAccount}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 pb-28">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom,0px))]">
        {activeTab === "account" || activeTab === "profile" ? (
          <AccountPage
            onBack={handleBackFromAccount}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isOnline={isOnline}
            lastSyncTime={lastSyncTime}
          />
        ) : (
          <>
            {/* Live Hero Showcase */}
            <HeroBanner
              totalBusesToday={totalBusesToday}
              nextDepartureCountdown={nextUpcomingDeparture?.countdown ?? null}
              nextDepartureTime={nextUpcomingDeparture?.time ?? null}
              totalActiveRoutes={totalActiveRoutes}
              selectedOperator={selectedOperator}
            />

            {/* Active Marked Trip Shelf */}
            {activeTrip && (
              <ActiveTripShelf
                activeTrip={activeTrip}
                now={now}
                onUnmark={handleUnmarkTrip}
                onSwitchTrip={handleSwitchTrip}
              />
            )}

            {/* Search & Filter Toolbar */}
            <div id="search-toolbar" className="mb-4 space-y-3">
              {/* Pill Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#75838c] dark:text-[#94a3b8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination, route (e.g., Kandy, Galle, 138)..."
                  className="w-full rounded-2xl border border-[#dce5e8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#17232c] placeholder-[#75838c] shadow-xs focus:border-blue-600 focus:outline-none dark:border-[#334155] dark:bg-[#162026] dark:text-white dark:placeholder-[#94a3b8] dark:focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Operator Chips Row */}
              <div className="flex items-center gap-2">
                {(
                  [
                    { key: "ALL", label: "All Operators" },
                    { key: "SLTB", label: "SLTB" },
                    { key: "PRIVATE", label: "PRIVATE" },
                  ] as const
                ).map((item) => {
                  const isSelected = selectedOperator === item.key;
                  const isSltb = item.key === "SLTB";
                  const isPrivate = item.key === "PRIVATE";

                  let activeClasses =
                    "bg-[#17232c] text-white shadow-xs dark:bg-slate-700 dark:text-white";
                  if (isSltb) {
                    activeClasses =
                      "bg-[#e94b50] text-white shadow-xs font-bold";
                  } else if (isPrivate) {
                    activeClasses =
                      "bg-[#ead57b] text-[#17232c] shadow-xs font-bold";
                  }

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedOperator(item.key)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                        isSelected
                          ? activeClasses
                          : "bg-white text-[#75838c] border border-[#dce5e8] hover:text-[#17232c] dark:bg-[#162026] dark:text-[#94a3b8] dark:border-[#334155] dark:hover:text-white shadow-xs"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Bus Service Classification Chips (Horizontal Scrollable) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {(
                  [
                    { key: "ALL", label: "All Types" },
                    { key: "NORMAL", label: "Normal" },
                    { key: "SEMI", label: "Semi-Exp" },
                    { key: "LUXURY_AC", label: "A/C Luxury" },
                    { key: "EXPRESSWAY", label: "Expressway" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`whitespace-nowrap rounded-xl px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                      selectedCategory === cat.key
                        ? "bg-[#17232c] text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs"
                        : "bg-white text-[#75838c] border border-[#dce5e8] hover:text-[#17232c] dark:bg-[#162026] dark:text-[#94a3b8] dark:border-[#334155] dark:hover:text-white shadow-xs"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Departures Sub-header: Services Count & Departed Visibility Toggle */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-bold text-[#17232c] dark:text-white font-display">
                  {filteredBuses.length}{" "}
                  {filteredBuses.length === 1 ? "service" : "services"} found
                </span>

                <button
                  type="button"
                  onClick={() => setShowDeparted(!showDeparted)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all ${
                    showDeparted
                      ? "border-[#17232c] bg-[#17232c] text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-slate-950"
                      : "border-[#dce5e8] bg-white text-[#75838c] hover:text-[#17232c] dark:border-[#334155] dark:bg-[#162026] dark:text-[#94a3b8] dark:hover:text-white"
                  }`}
                >
                  {showDeparted ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  <span>Departed</span>
                </button>
              </div>
            </div>

            {/* Timetable List */}
            {filteredBuses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dce5e8] dark:border-[#334155] p-8 text-center bg-white/40 dark:bg-[#162026]/40">
                <p className="text-sm font-semibold text-[#17232c] dark:text-slate-200">
                  No active departures to show.
                </p>
                <p className="mt-1 text-xs text-[#75838c] dark:text-[#94a3b8]">
                  {showDeparted
                    ? "Try adjusting your search criteria or type filters."
                    : 'Past buses are hidden. Turn on "Departed" to view them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBuses.map((bus) => (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    now={now}
                    onMarkTrip={handleMarkTrip}
                    isMarked={activeTripEntryId === bus.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Frosted Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasActiveTrip={!!activeTrip}
        isAuthenticated={isAuthenticated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
