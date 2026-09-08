import React, { useState } from "react";
import type { ValidatedScheduleRow } from "../../utils/spreadsheetParser";
import { apiClient } from "../../api/client";
import {
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Check,
  Loader2,
} from "lucide-react";

interface ImportPreviewTableProps {
  rows: ValidatedScheduleRow[];
  onUploadSuccess: () => void;
  onCancel: () => void;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  rows,
  onUploadSuccess,
  onCancel,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  const handleConfirmUpload = async () => {
    if (validRows.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await apiClient("/api/admin/timetable", {
          method: "POST",
          body: JSON.stringify({
            routeId: row.routeId,
            operatorType: row.operatorType,
            busCategory: row.busCategory,
            busNumber: row.busNumber,
            scheduledParkingTime: row.scheduledParkingTime,
            scheduledLeavingTime: row.scheduledLeavingTime,
          }),
        });
        successCount++;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown upload error";
        errors.push(`Row ${row.index} (${row.busNumber}): ${errorMsg}`);
      }

      setUploadProgress({ current: i + 1, total: validRows.length });
    }

    setIsUploading(false);

    if (errors.length > 0) {
      setUploadError(
        `Uploaded ${successCount} of ${validRows.length}. ${errors.length} failed:\n` +
          errors.slice(0, 3).join("; "),
      );
    } else {
      onUploadSuccess();
    }
  };

  const progressPercent =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{validRows.length} Valid Rows</span>
          </span>

          {invalidRows.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{invalidRows.length} Invalid Rows</span>
            </span>
          )}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total Parsed: {rows.length} rows
        </span>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-cyan-400" />
              <span>
                Uploaded {uploadProgress.current} of {uploadProgress.total}...
              </span>
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-cyan-500 h-2 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-bold">Some items failed to upload:</p>
            <p className="mt-0.5 whitespace-pre-wrap">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Preview Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#162026] shadow-xs">
        <div className="max-h-72 overflow-y-auto overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead className="sticky top-0 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-xs text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 z-10">
              <tr>
                <th className="px-3 py-2.5 w-12 text-center">#</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Route ID</th>
                <th className="px-3 py-2.5">Bus No</th>
                <th className="px-3 py-2.5">Operator</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Parking</th>
                <th className="px-3 py-2.5">Leaving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row) => (
                <tr
                  key={row.index}
                  className={`transition-colors ${
                    row.isValid
                      ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      : "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30"
                  }`}
                >
                  <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">
                    {row.index}
                  </td>

                  {/* Status Cell */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.isValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        <span>Valid</span>
                      </span>
                    ) : (
                      <div className="group relative inline-flex items-center gap-1 cursor-help">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Error</span>
                        </span>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:flex z-50 w-56 p-2 rounded-lg bg-slate-900 text-white text-[10px] shadow-lg flex-col gap-0.5 pointer-events-none">
                          <span className="font-bold text-rose-300">
                            Validation Errors:
                          </span>
                          {Object.entries(row.errors).map(([field, err]) => (
                            <span key={field} className="leading-tight">
                              • <strong>{field}</strong>: {err}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Route ID Cell */}
                  <td className="px-3 py-2 font-mono text-[11px] max-w-[120px] truncate">
                    <span
                      className={
                        row.errors.routeId
                          ? "text-rose-600 dark:text-rose-400 underline decoration-dotted"
                          : "text-slate-700 dark:text-slate-300"
                      }
                      title={row.errors.routeId || row.routeId}
                    >
                      {row.routeId || "—"}
                    </span>
                  </td>

                  {/* Bus Number */}
                  <td className="px-3 py-2 font-semibold">
                    <span
                      className={
                        row.errors.busNumber
                          ? "text-rose-600 dark:text-rose-400 underline decoration-dotted"
                          : "text-slate-900 dark:text-white"
                      }
                      title={row.errors.busNumber || row.busNumber}
                    >
                      {row.busNumber || "—"}
                    </span>
                  </td>

                  {/* Operator */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        row.operatorType === "SLTB"
                          ? "bg-[#e94b50]/10 text-[#e94b50] border-[#e94b50]/30"
                          : "bg-[#ead57b]/20 text-[#856804] border-[#ead57b]/40 dark:text-[#ead57b]"
                      } ${row.errors.operatorType ? "ring-1 ring-rose-500" : ""}`}
                      title={row.errors.operatorType}
                    >
                      {row.operatorType || "—"}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span
                      className={
                        row.errors.busCategory
                          ? "text-rose-600 dark:text-rose-400 underline decoration-dotted"
                          : ""
                      }
                      title={row.errors.busCategory}
                    >
                      {row.busCategory || "—"}
                    </span>
                  </td>

                  {/* Parking Time */}
                  <td className="px-3 py-2 font-mono whitespace-nowrap">
                    <span
                      className={
                        row.errors.scheduledParkingTime
                          ? "text-rose-600 dark:text-rose-400 underline decoration-dotted font-bold"
                          : "text-slate-600 dark:text-slate-300"
                      }
                      title={row.errors.scheduledParkingTime}
                    >
                      {row.scheduledParkingTime || "—"}
                    </span>
                  </td>

                  {/* Leaving Time */}
                  <td className="px-3 py-2 font-mono whitespace-nowrap">
                    <span
                      className={
                        row.errors.scheduledLeavingTime
                          ? "text-rose-600 dark:text-rose-400 underline decoration-dotted font-bold"
                          : "text-slate-900 dark:text-white font-bold"
                      }
                      title={row.errors.scheduledLeavingTime}
                    >
                      {row.scheduledLeavingTime || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleConfirmUpload}
          disabled={validRows.length === 0 || isUploading}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              <span>
                Confirm & Upload ({validRows.length}{" "}
                {validRows.length === 1 ? "row" : "rows"})
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
