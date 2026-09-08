import React, { useState, useRef } from "react";
import {
  X,
  FileSpreadsheet,
  Code2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  parseCSV,
  parseExcel,
  parseRawJSON,
  downloadCSVTemplate,
  type ValidatedScheduleRow,
} from "../../utils/spreadsheetParser";
import { ImportPreviewTable } from "./ImportPreviewTable";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = "spreadsheet" | "json";

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("spreadsheet");
  const [parsedRows, setParsedRows] = useState<ValidatedScheduleRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Raw JSON state
  const [rawJsonText, setRawJsonText] = useState<string>("");
  const [jsonFormatError, setJsonFormatError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setParsedRows([]);
    setParseError(null);
    setSelectedFileName(null);
    setJsonFormatError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setParseError(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      let results: ValidatedScheduleRow[] = [];

      if (fileNameLower.endsWith(".csv")) {
        results = await parseCSV(file);
      } else if (
        fileNameLower.endsWith(".xlsx") ||
        fileNameLower.endsWith(".xls")
      ) {
        results = await parseExcel(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload .csv, .xlsx, or .xls.",
        );
      }

      if (results.length === 0) {
        throw new Error(
          "The uploaded file appears to be empty or contains no data rows.",
        );
      }

      setParsedRows(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error parsing file";
      setParseError(message);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setParseError(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      let results: ValidatedScheduleRow[] = [];

      if (fileNameLower.endsWith(".csv")) {
        results = await parseCSV(file);
      } else if (
        fileNameLower.endsWith(".xlsx") ||
        fileNameLower.endsWith(".xls")
      ) {
        results = await parseExcel(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload .csv, .xlsx, or .xls.",
        );
      }

      setParsedRows(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error parsing file";
      setParseError(message);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
      setJsonFormatError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid JSON format";
      setJsonFormatError(message);
    }
  };

  const handleParseJson = () => {
    setJsonFormatError(null);
    setParseError(null);

    if (!rawJsonText.trim()) {
      setJsonFormatError("Please enter or paste a JSON array.");
      return;
    }

    try {
      const rows = parseRawJSON(rawJsonText);
      if (rows.length === 0) {
        setJsonFormatError("JSON array is empty.");
        return;
      }
      setParsedRows(rows);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error parsing JSON input";
      setJsonFormatError(message);
    }
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#162026] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Import Departure Schedules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload spreadsheets or paste raw JSON to import multiple
                departures
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            type="button"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {parsedRows.length === 0 ? (
            <>
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("spreadsheet");
                    setParseError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === "spreadsheet"
                      ? "bg-white dark:bg-[#1e262c] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  <span>Spreadsheet Upload (.csv, .xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("json");
                    setParseError(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === "json"
                      ? "bg-white dark:bg-[#1e262c] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  <Code2 className="h-4 w-4 text-blue-500" />
                  <span>Raw JSON</span>
                </button>
              </div>

              {/* Parsing Error Banner */}
              {parseError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Tab A: Spreadsheet Upload */}
              {activeTab === "spreadsheet" && (
                <div className="space-y-4">
                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 group-hover:scale-105 text-blue-600 dark:text-cyan-400 flex items-center justify-center transition-transform shadow-xs">
                      <Upload className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Click or drag & drop spreadsheet here
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports standard CSV (.csv) or Microsoft Excel (.xlsx,
                        .xls)
                      </p>
                    </div>

                    {selectedFileName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-cyan-300 text-xs font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{selectedFileName}</span>
                      </span>
                    )}

                    {isParsing && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Parsing and normalizing spreadsheet data...</span>
                      </div>
                    )}
                  </div>

                  {/* Template Download Section */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Need a starting template?
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Download pre-formatted CSV template with all required
                        columns and sample rows.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs active:scale-95 transition-all"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>Download Template (.csv)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab B: Raw JSON */}
              {activeTab === "json" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paste JSON Schedule Array
                    </span>
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Format / Prettify</span>
                    </button>
                  </div>

                  {jsonFormatError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{jsonFormatError}</span>
                    </div>
                  )}

                  <textarea
                    rows={10}
                    value={rawJsonText}
                    onChange={(e) => {
                      setRawJsonText(e.target.value);
                      setJsonFormatError(null);
                    }}
                    placeholder={`[\n  {\n    "routeId": "00000000-0000-0000-0000-000000000001",\n    "operatorType": "SLTB",\n    "busCategory": "NORMAL",\n    "busNumber": "NB-1234",\n    "scheduledParkingTime": "08:45",\n    "scheduledLeavingTime": "09:00"\n  }\n]`}
                    className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 resize-none"
                  />

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleParseJson}
                      disabled={!rawJsonText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-40"
                    >
                      <Code2 className="h-4 w-4" />
                      <span>Validate & Preview Rows</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Preview Stage */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Step 2: Preview & Validation Check
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                >
                  Choose Another File / Re-paste
                </button>
              </div>

              <ImportPreviewTable
                rows={parsedRows}
                onCancel={handleReset}
                onUploadSuccess={() => {
                  onSuccess();
                  handleModalClose();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
