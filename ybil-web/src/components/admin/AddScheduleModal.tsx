import React, { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  Bus,
  Loader2,
  AlertCircle,
  Check,
  MapPin,
} from "lucide-react";
import type { OperatorType, BusCategory, Route } from "../../types/transit";
import { timetableRepository } from "../../db/timetableRepository";
import { apiClient } from "../../api/client";

interface AddScheduleModalProps {
  isOpen: boolean;
  initialRouteId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  initialRouteId,
  onClose,
  onSuccess,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    initialRouteId || "",
  );
  const [isCustomRoute, setIsCustomRoute] = useState(false);
  const [customRouteId, setCustomRouteId] = useState("");
  const [operatorType, setOperatorType] = useState<OperatorType>("SLTB");
  const [busCategory, setBusCategory] = useState<BusCategory>("NORMAL");
  const [busNumber, setBusNumber] = useState("");
  const [parkingTime, setParkingTime] = useState("08:00");
  const [leavingTime, setLeavingTime] = useState("08:30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      timetableRepository.getAllRoutes().then((cachedRoutes) => {
        setRoutes(cachedRoutes);
        if (initialRouteId) {
          setSelectedRouteId(initialRouteId);
        } else if (cachedRoutes.length > 0 && !selectedRouteId) {
          setSelectedRouteId(cachedRoutes[0].id);
        }
      });
      setErrorMessage(null);
    }
  }, [isOpen, initialRouteId, selectedRouteId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalRouteId = isCustomRoute ? customRouteId.trim() : selectedRouteId;

    if (!finalRouteId) {
      setErrorMessage("Please select or specify a Route ID.");
      return;
    }

    if (!UUID_REGEX.test(finalRouteId)) {
      setErrorMessage(
        "Route ID must be a valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000).",
      );
      return;
    }

    if (!busNumber.trim()) {
      setErrorMessage("Bus Plate / Number is required.");
      return;
    }

    if (!parkingTime || !leavingTime) {
      setErrorMessage("Scheduled parking and leaving times are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient("/api/admin/timetable", {
        method: "POST",
        body: JSON.stringify({
          routeId: finalRouteId,
          operatorType,
          busCategory,
          busNumber: busNumber.trim(),
          scheduledParkingTime: parkingTime,
          scheduledLeavingTime: leavingTime,
        }),
      });

      // Reset form
      setBusNumber("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add schedule";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-schedule-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#162026] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <PlusCircle className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="add-schedule-title"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                Add New Schedule
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Register a new departure slot in the master timetable
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
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {/* Route Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="routeSelect"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Route Assignment
              </label>
              <button
                type="button"
                onClick={() => setIsCustomRoute(!isCustomRoute)}
                className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline font-medium"
              >
                {isCustomRoute
                  ? "Pick from cached routes"
                  : "Custom Route UUID"}
              </button>
            </div>

            {isCustomRoute ? (
              <input
                type="text"
                value={customRouteId}
                onChange={(e) => setCustomRouteId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                required
              />
            ) : (
              <div className="relative">
                <select
                  id="routeSelect"
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
                  required
                >
                  {routes.length === 0 ? (
                    <option value="" disabled>
                      No cached routes found
                    </option>
                  ) : (
                    routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        Route {r.routeNumber} — {r.origin} ➔ {r.destination}
                      </option>
                    ))
                  )}
                </select>
                <MapPin className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Bus Plate Number */}
          <div>
            <label
              htmlFor="busNumberInput"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
            >
              Bus Plate / Registration Number
            </label>
            <div className="relative">
              <Bus className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="busNumberInput"
                type="text"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. ND-5432 or WP NB-9988"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono uppercase focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Operator Type Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Transit Operator
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperatorType("SLTB")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  operatorType === "SLTB"
                    ? "border-[#e94b50] bg-[#e94b50] text-white shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>SLTB (State)</span>
              </button>

              <button
                type="button"
                onClick={() => setOperatorType("PRIVATE")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  operatorType === "PRIVATE"
                    ? "border-[#ead57b] bg-[#ead57b] text-[#17232c] shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>Private Operator</span>
              </button>
            </div>
          </div>

          {/* Bus Category Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Service Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { key: "NORMAL", label: "Normal" },
                  { key: "SEMI", label: "Semi-Lux" },
                  { key: "LUXURY_AC", label: "Luxury AC" },
                  { key: "EXPRESSWAY", label: "Express" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setBusCategory(cat.key)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                    busCategory === cat.key
                      ? "border-[#17232c] bg-[#17232c] text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-slate-950 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="addParkingTime"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
              >
                Scheduled Parking Time
              </label>
              <input
                id="addParkingTime"
                type="time"
                value={parkingTime}
                onChange={(e) => setParkingTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="addLeavingTime"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
              >
                Scheduled Leaving Time
              </label>
              <input
                id="addLeavingTime"
                type="time"
                value={leavingTime}
                onChange={(e) => setLeavingTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/40">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#17232c] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Add Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
