import { useState, useEffect, useMemo } from "react";
import { useSync } from "./hooks/useSync";
import { timetableRepository } from "./db/timetableRepository";
import type { TimetableEntry } from "./types/transit";
import { Header } from "./components/Header";
import { BusCard } from "./components/BusCard";
import { AuthModal } from "./components/AuthModal";
import { Search, Filter } from "lucide-react";

export default function App() {
  const { isSyncing, isOnline, lastSyncTime, triggerSync } = useSync();
  const [buses, setBuses] = useState<TimetableEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<
    "ALL" | "SLTB" | "PRIVATE"
  >("ALL");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadCachedTimetable = async () => {
    const list = await timetableRepository.getAllEntries();
    setBuses(list);
  };

  useEffect(() => {
    loadCachedTimetable();
  }, [lastSyncTime]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch =
        bus.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOperator =
        selectedOperator === "ALL" || bus.operatorType === selectedOperator;

      return matchesSearch && matchesOperator;
    });
  }, [buses, searchQuery, selectedOperator]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={triggerSync}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {/* Search & Filter Bar */}
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
        </div>

        {/* Timetable List View */}
        {filteredBuses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400">
              No scheduled departures found.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search filter or tap sync to fetch updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
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
