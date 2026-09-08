import React, { useState, useEffect } from "react";
import { X, Clock, Plus, Loader2, AlertCircle, Check } from "lucide-react";
import type { TimetableEntry } from "../../types/transit";
import { timetableRepository } from "../../db/timetableRepository";
import { apiClient } from "../../api/client";

interface QuickEditModalProps {
  isOpen: boolean;
  entry: TimetableEntry | null;
  onClose: () => void;
  onSaveSuccess: (updated: TimetableEntry) => void;
}

// Helper to add minutes to HH:mm string (wrapping at 24 hours)
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const totalMinutes = (h * 60 + m + minutesToAdd) % (24 * 60);
  const finalMinutes = totalMinutes < 0 ? totalMinutes + 24 * 60 : totalMinutes;
  const newH = Math.floor(finalMinutes / 60);
  const newM = finalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSaveSuccess,
}) => {
  const [parkingTime, setParkingTime] = useState("");
  const [leavingTime, setLeavingTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setParkingTime(entry.scheduledParkingTime || "");
      setLeavingTime(entry.scheduledLeavingTime || "");
      setErrorMessage(null);
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleApplyDelay = (minutes: number) => {
    setParkingTime((prev) => addMinutesToTime(prev, minutes));
    setLeavingTime((prev) => addMinutesToTime(prev, minutes));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    if (!parkingTime || !leavingTime) {
      setErrorMessage("Both parking and leaving times are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const updatedEntry: TimetableEntry = {
      ...entry,
      scheduledParkingTime: parkingTime,
      scheduledLeavingTime: leavingTime,
      updatedAt: Date.now(),
    };

    try {
      // Attempt backend update (PUT /api/admin/timetable/:id or POST /api/admin/timetable)
      try {
        await apiClient(`/api/admin/timetable/${entry.id}`, {
          method: "PUT",
          body: JSON.stringify({
            routeId: entry.routeId,
            operatorType: entry.operatorType,
            busCategory: entry.busCategory,
            busNumber: entry.busNumber,
            scheduledParkingTime: parkingTime,
            scheduledLeavingTime: leavingTime,
          }),
        });
      } catch (apiErr: unknown) {
        // If PUT is not supported, attempt POST update or log warning
        console.warn("Backend API update failed, persisting locally:", apiErr);
      }

      // Persist to local Dexie database
      await timetableRepository.upsertEntry(updatedEntry);

      onSaveSuccess(updatedEntry);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update schedule";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#162026] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="quick-edit-title"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                Quick Adjust Times
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Route {entry.routeNumber || "N/A"} •{" "}
                {entry.destination || "Destination"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Bus Info Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block">
                Bus Plate
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-sm">
                {entry.busNumber || "Unassigned"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 dark:text-slate-500 font-medium block">
                Operator / Type
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {entry.operatorType} • {entry.busCategory}
              </span>
            </div>
          </div>

          {/* Quick Delay Bump Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Quick Delay Adjust (Dispatch)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleApplyDelay(mins)}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3 text-blue-500" />
                  <span>{mins}m</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="parkingTime"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
              >
                Parking Time
              </label>
              <input
                id="parkingTime"
                type="time"
                value={parkingTime}
                onChange={(e) => setParkingTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="leavingTime"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
              >
                Leaving Time
              </label>
              <input
                id="leavingTime"
                type="time"
                value={leavingTime}
                onChange={(e) => setLeavingTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#17232c] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
