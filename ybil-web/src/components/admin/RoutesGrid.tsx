import React, { useState, useMemo } from "react";
import { Search, MapPin, Plus, Copy, Check, Bus } from "lucide-react";
import type { Route } from "../../types/transit";

interface RoutesGridProps {
  routes: Route[];
  scheduleCountByRouteId?: Record<string, number>;
  onAddScheduleForRoute: (route: Route) => void;
  onAddRoute: () => void;
  isLoading?: boolean;
}

export const RoutesGrid: React.FC<RoutesGridProps> = ({
  routes,
  scheduleCountByRouteId = {},
  onAddScheduleForRoute,
  onAddRoute,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.routeNumber.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }, [routes, searchQuery]);

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white dark:bg-[#162026] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes by number, origin, or destination..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onAddRoute}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-98 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Route</span>
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white dark:bg-[#162026] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Stats Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Showing {filteredRoutes.length} of {routes.length} transit routes
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 whitespace-nowrap">Route #</th>
                <th className="py-3 px-4 whitespace-nowrap">
                  Origin ➔ Destination
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Route UUID</th>
                <th className="py-3 px-4 whitespace-nowrap">Departures</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    Loading routes data...
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    No routes found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => {
                  const departuresCount = scheduleCountByRouteId[route.id] || 0;
                  return (
                    <tr
                      key={route.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Route Number Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-cyan-400 dark:border-blue-900/40">
                          <MapPin className="h-3 w-3" />
                          <span>{route.routeNumber}</span>
                        </span>
                      </td>

                      {/* Origin and Destination */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {route.origin || "Colombo Central"}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {route.destination}
                          </span>
                        </div>
                      </td>

                      {/* Route UUID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          <span
                            className="truncate max-w-[120px]"
                            title={route.id}
                          >
                            {route.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(route.id)}
                            title="Copy full Route UUID"
                            aria-label={`Copy UUID for route ${route.routeNumber}`}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                          >
                            {copiedId === route.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Departures count */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <Bus className="h-3 w-3 text-slate-400" />
                          <span>
                            {departuresCount}{" "}
                            {departuresCount === 1 ? "service" : "services"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onAddScheduleForRoute(route)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs active:scale-95 transition-all"
                        >
                          <Plus className="h-3 w-3 text-blue-500" />
                          <span>Add Schedule</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
