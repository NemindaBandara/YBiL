import React, { useState } from "react";
import { X, MapPin, Loader2, AlertCircle, Check } from "lucide-react";
import type { Route } from "../../types/transit";
import { timetableRepository } from "../../db/timetableRepository";
import { apiClient } from "../../api/client";

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRoute: Route) => void;
}

export const AddRouteModal: React.FC<AddRouteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [routeNumber, setRouteNumber] = useState("");
  const [origin, setOrigin] = useState("Colombo Central");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanRouteNumber = routeNumber.trim();
    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();

    if (!cleanRouteNumber) {
      setErrorMessage("Route number is required (e.g. 138, 100, EX-01).");
      return;
    }

    if (!cleanOrigin) {
      setErrorMessage("Origin is required.");
      return;
    }

    if (!cleanDestination) {
      setErrorMessage("Destination is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdRoute = await apiClient<Route>("/api/admin/routes", {
        method: "POST",
        body: JSON.stringify({
          routeNumber: cleanRouteNumber,
          origin: cleanOrigin,
          destination: cleanDestination,
        }),
      });

      // Update local Dexie storage
      if (createdRoute && createdRoute.id) {
        await timetableRepository.upsertRoute(createdRoute);
      }

      // Reset form
      setRouteNumber("");
      setOrigin("Colombo Central");
      setDestination("");

      onSuccess(createdRoute);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create route";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-route-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#162026] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="add-route-title"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                Add New Transit Route
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Register a new corridor in the master transit network
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Route Number */}
          <div>
            <label
              htmlFor="routeNumberInput"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
            >
              Route Number / Code
            </label>
            <input
              id="routeNumberInput"
              type="text"
              value={routeNumber}
              onChange={(e) => setRouteNumber(e.target.value)}
              placeholder="e.g. 138, 100, EX-01"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              Used as the identifier when importing spreadsheets and assigning
              schedules.
            </span>
          </div>

          {/* Origin */}
          <div>
            <label
              htmlFor="originInput"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
            >
              Origin (Starting Point)
            </label>
            <input
              id="originInput"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Colombo Central, Pettah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label
              htmlFor="destinationInput"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block"
            >
              Destination (Final Stop)
            </label>
            <input
              id="destinationInput"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Maharagama, Kandy, Galle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#17232c] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Route...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Create Route</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
