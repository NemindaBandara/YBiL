import { useState, useEffect, useMemo, useCallback } from "react";
import { useSync } from "./hooks/useSync";
import { useAuth } from "./context/AuthContext";
import { useLiveClock } from "./hooks/useLiveClock";
import { apiClient } from "./api/client";
import { timetableRepository } from "./db/timetableRepository";
import type { TimetableEntry, MarkedTrip } from "./types/transit";
import { getDepartureStatus } from "./utils/timeUtils";
import { Header } from "./components/Header";
import { BusCard } from "./components/BusCard";
import { ActiveTripShelf } from "./components/ActiveTripShelf";
import { AuthModal } from "./components/AuthModal";
import { Search, Filter, Eye, EyeOff } from "lucide-react";

export default function App() {
  const now = useLiveClock(15000); // 15s interval tick
  const { isSyncing, isOnline, lastSyncTime, triggerSync } = useSync();
  const { isAuthenticated, user } = useAuth();

  const [buses, setBuses] = useState<TimetableEntry[]>([]);
  const [activeTrip, setActiveTrip] = useState<MarkedTrip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<
    "ALL" | "SLTB" | "PRIVATE"
  >("ALL");
  const [showDeparted, setShowDeparted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadCachedTimetable = async () => {
    const list = await timetableRepository.getAllEntries();
    setBuses(list);
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
        // Pick the most recently marked trip (or the first ACTIVE one)
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
  }, [lastSyncTime]);

  // Re-fetch active trip whenever the user logs in, out, or loads the page
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

  // With backend auto-supersede, marking a new bus will automatically cancel the old one
  const handleSwitchTrip = async (newEntryId: string) => {
    await handleMarkTrip(newEntryId);
  };

  const activeTripEntryId = useMemo(() => {
    if (!activeTrip) return null;
    return activeTrip.timetableEntry?.id ?? null;
  }, [activeTrip]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const status = getDepartureStatus(bus.scheduledLeavingTime, now);

      // Auto-prune departed buses unless "Show departed" toggle is enabled
      if (!showDeparted && status.shouldHide) {
        return false;
      }

      const matchesSearch =
        bus.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOperator =
        selectedOperator === "ALL" || bus.operatorType === selectedOperator;

      return matchesSearch && matchesOperator;
    });
  }, [buses, searchQuery, selectedOperator, showDeparted, now]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={triggerSync}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {activeTrip && (
          <ActiveTripShelf
            activeTrip={activeTrip}
            now={now}
            onUnmark={handleUnmarkTrip}
            onSwitchTrip={handleSwitchTrip}
          />
        )}

        {/* Search & Filter Toolbar */}
        <div className="mb-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination (e.g., Kandy, Galle, 100)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-500 mr-1" />
              {(["ALL", "SLTB", "PRIVATE"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedOperator(type)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    selectedOperator === type
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {type === "ALL" ? "All Operators" : type}
                </button>
              ))}
            </div>

            {/* Departed Toggle */}
            <button
              onClick={() => setShowDeparted(!showDeparted)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border transition ${
                showDeparted
                  ? "border-slate-600 bg-slate-800 text-slate-200"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
            >
              {showDeparted ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              <span>Departed</span>
            </button>
          </div>
        </div>

        {/* Timetable List */}
        {filteredBuses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400">
              No active departures to show.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {showDeparted
                ? "Try adjusting your search criteria."
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
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
