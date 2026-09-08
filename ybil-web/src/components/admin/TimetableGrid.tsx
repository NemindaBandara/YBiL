import React, { useState, useMemo } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import type {
  TimetableEntry,
  OperatorType,
  BusCategory,
} from "../../types/transit";

interface TimetableGridProps {
  buses: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (entry: TimetableEntry) => void;
  isLoading?: boolean;
}

const ROWS_PER_PAGE = 15;

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  buses,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<
    "ALL" | OperatorType
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | BusCategory>(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered rows
  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (bus.busNumber && bus.busNumber.toLowerCase().includes(q)) ||
        (bus.routeNumber && bus.routeNumber.toLowerCase().includes(q)) ||
        (bus.destination && bus.destination.toLowerCase().includes(q)) ||
        (bus.origin && bus.origin.toLowerCase().includes(q));

      const matchesOperator =
        selectedOperator === "ALL" || bus.operatorType === selectedOperator;

      const matchesCategory =
        selectedCategory === "ALL" ||
        (bus.busCategory ?? "NORMAL") === selectedCategory;

      return matchesSearch && matchesOperator && matchesCategory;
    });
  }, [buses, searchQuery, selectedOperator, selectedCategory]);

  // Reset pagination when filters change
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBuses.length / ROWS_PER_PAGE),
  );
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (validCurrentPage - 1) * ROWS_PER_PAGE;
    return filteredBuses.slice(start, start + ROWS_PER_PAGE);
  }, [filteredBuses, validCurrentPage]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#162026] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by plate, route, or destination..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-600 dark:focus:border-cyan-400 focus:outline-none transition-all"
            />
          </div>

          {/* Operator Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { key: "ALL", label: "All Operators" },
                { key: "SLTB", label: "SLTB" },
                { key: "PRIVATE", label: "Private" },
              ] as const
            ).map((op) => (
              <button
                key={op.key}
                type="button"
                onClick={() => {
                  setSelectedOperator(op.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOperator === op.key
                    ? op.key === "SLTB"
                      ? "bg-[#e94b50] text-white shadow-xs"
                      : op.key === "PRIVATE"
                        ? "bg-[#ead57b] text-slate-900 shadow-xs"
                        : "bg-slate-900 text-white dark:bg-slate-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pt-1 border-t border-slate-100 dark:border-slate-800">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1" />
          {(
            [
              { key: "ALL", label: "All Classes" },
              { key: "NORMAL", label: "Normal" },
              { key: "SEMI", label: "Semi-Lux" },
              { key: "LUXURY_AC", label: "Luxury AC" },
              { key: "EXPRESSWAY", label: "Expressway" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#162026] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Stats Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Showing{" "}
            {filteredBuses.length === 0
              ? 0
              : (validCurrentPage - 1) * ROWS_PER_PAGE + 1}{" "}
            - {Math.min(validCurrentPage * ROWS_PER_PAGE, filteredBuses.length)}{" "}
            of {filteredBuses.length} schedules
          </span>
          {filteredBuses.length > 0 && (
            <span>
              Page {validCurrentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 whitespace-nowrap">
                  Route / Destination
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Bus Plate</th>
                <th className="py-3 px-4 whitespace-nowrap">Operator</th>
                <th className="py-3 px-4 whitespace-nowrap">Category</th>
                <th className="py-3 px-4 whitespace-nowrap">Parking</th>
                <th className="py-3 px-4 whitespace-nowrap">Leaving</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    Loading timetable data...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    No matching schedules found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-blue-600 dark:text-cyan-400 font-mono">
                          {row.routeNumber || "—"}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate max-w-[150px] font-semibold text-slate-900 dark:text-white">
                          {row.destination || "Destination"}
                        </span>
                      </div>
                      {row.origin && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>From {row.origin}</span>
                        </span>
                      )}
                    </td>

                    {/* Plate */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                        {row.busNumber || "—"}
                      </span>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          row.operatorType === "SLTB"
                            ? "bg-[#e94b50]/15 text-[#e94b50] border border-[#e94b50]/30"
                            : "bg-[#ead57b]/25 text-[#917616] dark:text-[#ead57b] border border-[#ead57b]/40"
                        }`}
                      >
                        {row.operatorType}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {row.busCategory || "NORMAL"}
                      </span>
                    </td>

                    {/* Parking Time */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{row.scheduledParkingTime}</span>
                      </div>
                    </td>

                    {/* Leaving Time */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>{row.scheduledLeavingTime}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          title="Quick edit parking and departure times"
                          aria-label={`Edit schedule for bus ${row.busNumber || row.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors relative before:absolute before:-inset-1 before:content-['']"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          title="Delete schedule"
                          aria-label={`Delete schedule for bus ${row.busNumber || row.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors relative before:absolute before:-inset-1 before:content-['']"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
