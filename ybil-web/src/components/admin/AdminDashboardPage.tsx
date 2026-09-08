import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Shield,
  Plus,
  UploadCloud,
  RefreshCw,
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import type { TimetableEntry, Route } from "../../types/transit";
import { timetableRepository } from "../../db/timetableRepository";
import { syncService } from "../../sync/syncService";
import { apiClient } from "../../api/client";
import { TimetableGrid } from "./TimetableGrid";
import { RoutesGrid } from "./RoutesGrid";
import { AddScheduleModal } from "./AddScheduleModal";
import { AddRouteModal } from "./AddRouteModal";
import { QuickEditModal } from "./QuickEditModal";
import { BulkImportModal } from "./BulkImportModal";

interface AdminDashboardPageProps {
  onBack: () => void;
  isOnline: boolean;
  lastSyncTime: number;
  onForceSync: () => Promise<void>;
}

type AdminSection = "schedules" | "routes";

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBack,
  isOnline,
  lastSyncTime,
  onForceSync,
}) => {
  const [buses, setBuses] = useState<TimetableEntry[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingCache, setIsResettingCache] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("schedules");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimetableEntry | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRouteForSchedule, setSelectedRouteForSchedule] = useState<
    string | undefined
  >(undefined);

  // Toast feedback
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entriesData, routesData] = await Promise.all([
        timetableRepository.getAllEntries(),
        timetableRepository.getAllRoutes(),
      ]);
      setBuses(entriesData);
      setRoutes(routesData);

      // In background, sync routes from server if online
      timetableRepository.syncRoutesFromServer().then((fresh) => {
        if (fresh && fresh.length > 0) {
          setRoutes(fresh);
        }
      });
    } catch (err) {
      console.error(
        "Failed to load cached timetable or routes for admin:",
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, lastSyncTime]);

  // Derived metrics
  const totalDepartures = buses.length;
  const activeRoutesCount =
    routes.length > 0
      ? routes.length
      : new Set(buses.map((b) => b.routeNumber || b.routeId)).size;

  const scheduleCountByRouteId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of buses) {
      if (b.routeId) {
        counts[b.routeId] = (counts[b.routeId] || 0) + 1;
      }
    }
    return counts;
  }, [buses]);

  const formattedSyncTime = useMemo(() => {
    if (lastSyncTime <= 0) return "Pending sync";
    return new Date(lastSyncTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastSyncTime]);

  // Action handlers
  const handleForceCacheInvalidation = async () => {
    if (isResettingCache) return;
    setIsResettingCache(true);
    try {
      const result = await syncService.resetAndSync();
      if (result.success) {
        await loadData();
        showToast(`Cache invalidated & synced ${result.syncedCount} entries.`);
      } else {
        showToast(result.error || "Failed to sync with server.", "error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resetting cache";
      showToast(msg, "error");
    } finally {
      setIsResettingCache(false);
    }
  };

  const handleScheduleAdded = async () => {
    await onForceSync();
    await loadData();
    showToast("New schedule added successfully!");
  };

  const handleRouteAdded = async (newRoute: Route) => {
    setRoutes((prev) => {
      const exists = prev.some((r) => r.id === newRoute.id);
      return exists ? prev : [...prev, newRoute];
    });
    showToast(
      `Route ${newRoute.routeNumber} (${newRoute.origin} ➔ ${newRoute.destination}) created!`,
    );
  };

  const handleQuickEditSuccess = async (updated: TimetableEntry) => {
    setBuses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast(`Times updated for bus ${updated.busNumber || updated.id}`);
  };

  const handleBulkImportSuccess = async () => {
    await onForceSync();
    await loadData();
    showToast("Bulk import completed and timetable synchronized!");
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;
    setIsDeleting(true);

    try {
      // Attempt backend deletion
      try {
        await apiClient(`/api/admin/timetable/${deletingEntry.id}`, {
          method: "DELETE",
        });
      } catch (apiErr) {
        console.warn("Backend DELETE call failed or unavailable:", apiErr);
      }

      // Remove from local IndexedDB
      await timetableRepository.deleteEntry(deletingEntry.id);
      setBuses((prev) => prev.filter((b) => b.id !== deletingEntry.id));
      showToast(
        `Deleted schedule for bus ${deletingEntry.busNumber || deletingEntry.id}`,
      );
      setDeletingEntry(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete schedule";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border backdrop-blur-md animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/20"
              : "bg-rose-500/90 text-white border-rose-400 shadow-rose-500/20"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            type="button"
            title="Go back"
            aria-label="Go back to departures"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition-transform relative before:absolute before:-inset-1 before:content-['']"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                <Shield className="h-4 w-4" />
              </span>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Management Portal
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Manage timetable schedules, transit routes & bulk spreadsheet
              import
            </p>
          </div>
        </div>

        {/* Connection status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162026] text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Departures */}
        <div className="bg-white dark:bg-[#162026] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Scheduled Departures
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono leading-tight">
              {totalDepartures}
            </span>
          </div>
        </div>

        {/* Metric 2: Routes */}
        <div className="bg-white dark:bg-[#162026] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Registered Routes
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono leading-tight">
              {activeRoutesCount}
            </span>
          </div>
        </div>

        {/* Metric 3: Sync Timestamp */}
        <div className="bg-white dark:bg-[#162026] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Cache Synchronized
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono leading-tight">
              {formattedSyncTime}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setSelectedRouteForSchedule(undefined);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#17232c] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold shadow-xs active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddRouteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Route</span>
        </button>

        <button
          type="button"
          onClick={() => setIsBulkImportOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#162026] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs active:scale-98 transition-all"
        >
          <UploadCloud className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
          <span>Bulk Import (CSV / XLSX / JSON)</span>
        </button>

        <button
          type="button"
          onClick={handleForceCacheInvalidation}
          disabled={isResettingCache}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#162026] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs active:scale-98 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 text-slate-500 ${isResettingCache ? "animate-spin" : ""}`}
          />
          <span>Force Cache Invalidation</span>
        </button>
      </div>

      {/* Management Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection("schedules")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "schedules"
              ? "bg-[#17232c] text-white dark:bg-slate-700 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Bus className="h-4 w-4" />
          <span>Timetable Schedules ({buses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("routes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "routes"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Routes Management ({routes.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeSection === "schedules" ? (
        <div className="space-y-3">
          <TimetableGrid
            buses={buses}
            isLoading={isLoading}
            onEdit={(entry) => setEditingEntry(entry)}
            onDelete={(entry) => setDeletingEntry(entry)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <RoutesGrid
            routes={routes}
            scheduleCountByRouteId={scheduleCountByRouteId}
            onAddScheduleForRoute={(route) => {
              setSelectedRouteForSchedule(route.id);
              setIsAddModalOpen(true);
            }}
            onAddRoute={() => setIsAddRouteOpen(true)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        initialRouteId={selectedRouteForSchedule}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedRouteForSchedule(undefined);
        }}
        onSuccess={handleScheduleAdded}
      />

      {/* Add Route Modal */}
      <AddRouteModal
        isOpen={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
        onSuccess={handleRouteAdded}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={handleBulkImportSuccess}
      />

      {/* Quick Edit Modal */}
      <QuickEditModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSaveSuccess={handleQuickEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deletingEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#162026] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="text-center space-y-1">
              <h3
                id="delete-dialog-title"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                Delete Schedule?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete bus{" "}
                <strong className="text-slate-900 dark:text-white">
                  {deletingEntry.busNumber || "unassigned"}
                </strong>{" "}
                on Route {deletingEntry.routeNumber} (
                {deletingEntry.destination}) departing at{" "}
                {deletingEntry.scheduledLeavingTime}?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
