import React, { useMemo, useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  RotateCcw,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { SalesRecord } from '../types/sales';
import { computeAnalytics, formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { downloadSampleCsvTemplate, parseSalesFile } from '../utils/datasetIO';

interface UploadDatasetProps {
  activeRecords: SalesRecord[];
  activeDatasetName: string;
  isCustomDataset: boolean;
  onActivateDataset: (records: SalesRecord[], name: string) => void;
  onResetSample: () => void;
}

const PAGE_SIZE = 12;

export const UploadDataset: React.FC<UploadDatasetProps> = ({
  activeRecords,
  activeDatasetName,
  isCustomDataset,
  onActivateDataset,
  onResetSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stagedRecords, setStagedRecords] = useState<SalesRecord[] | null>(null);
  const [stagedName, setStagedName] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Search & filter state for table inspection
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const displayedRecords = stagedRecords ?? activeRecords;
  const displayedName = stagedRecords ? stagedName : activeDatasetName;

  const calculatedStats = useMemo(
    () => computeAnalytics(displayedRecords, 'All', 'All'),
    [displayedRecords]
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(displayedRecords.map((r) => r.category))).sort(),
    [displayedRecords]
  );

  const uniqueRegions = useMemo(
    () => Array.from(new Set(displayedRecords.map((r) => r.region))).sort(),
    [displayedRecords]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return displayedRecords.filter((r) => {
      const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
      const matchReg = regionFilter === 'All' || r.region === regionFilter;
      const matchSearch =
        !q ||
        r.orderId.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.date.includes(q);
      return matchCat && matchReg && matchSearch;
    });
  }, [displayedRecords, searchQuery, categoryFilter, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const processFile = async (file: File) => {
    setErrorMsg('');
    setWarnings([]);
    setIsParsing(true);
    try {
      const parsed = await parseSalesFile(file);
      setStagedRecords(parsed.records);
      setStagedName(file.name);
      setWarnings(parsed.warnings);
      setCurrentPage(1);
      setCategoryFilter('All');
      setRegionFilter('All');
      setSearchQuery('');
      // Immediately activate across dashboard so user sees live updates effortlessly
      onActivateDataset(parsed.records, file.name);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to parse file. Please upload a valid CSV or Excel (.xlsx/.xls) sales file.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleReset = () => {
    setStagedRecords(null);
    setStagedName('');
    setWarnings([]);
    setErrorMsg('');
    setCategoryFilter('All');
    setRegionFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
    onResetSample();
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone & Template Card */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Upload CSV or Excel Sales Dataset
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports .csv, .xlsx, and .xls files. Uploaded data automatically recalculates all dashboard charts and business insights.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadSampleCsvTemplate}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Sample CSV Template</span>
            </button>
            {isCustomDataset && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Sample Data</span>
              </button>
            )}
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-600 bg-blue-50/70'
              : 'border-slate-300 bg-slate-50/60 hover:border-blue-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="font-display text-sm font-bold text-slate-900">
            {isParsing ? 'Processing dataset...' : 'Drag and drop your sales dataset here'}
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Auto-detects Date, Product, Category, Customer, Region, Quantity, Revenue, and Profit columns
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Select CSV or Excel File</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isCustomDataset && !errorMsg && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
            <div>
              <p className="font-semibold">
                Active uploaded dataset: {displayedName} ({displayedRecords.length} records loaded)
              </p>
              {warnings.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-emerald-700 space-y-0.5">
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Calculated Summary from Active / Uploaded Dataset */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Total Sales (Units)</p>
          <p className="font-display text-xl font-bold text-slate-900 tabular-nums mt-1">
            {formatNumber(calculatedStats.summary.totalSalesUnits)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Calculated Revenue</p>
          <p className="font-display text-xl font-bold text-blue-700 tabular-nums mt-1">
            {formatCurrency(calculatedStats.summary.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Calculated Profit</p>
          <p className="font-display text-xl font-bold text-emerald-700 tabular-nums mt-1">
            {formatCurrency(calculatedStats.summary.totalProfit)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium">Total Orders</p>
          <p className="font-display text-xl font-bold text-slate-900 tabular-nums mt-1">
            {formatNumber(calculatedStats.summary.totalOrders)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 font-medium">Profit Margin</p>
          <p className="font-display text-xl font-bold text-slate-900 tabular-nums mt-1">
            {calculatedStats.summary.profitMarginPct}%
          </p>
        </div>
      </section>

      {/* Searchable & Filterable Data Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Dataset Records Explorer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: {displayedName} · Showing {filteredRows.length.toLocaleString()} matching rows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-none sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search order, product, customer..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter table by category"
              className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter table by region"
              className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">All Regions</option>
              {uniqueRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Order ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 pl-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRows.map((row, idx) => (
                <tr key={`${row.orderId}-${idx}`} className="hover:bg-slate-50">
                  <td className="py-2.5 pr-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                    {row.orderId}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[190px] truncate">
                    {row.product}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.category}</td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-[170px] truncate">
                    {row.customer}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.region}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    {row.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(row.revenue, 2)}
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono tabular-nums font-medium text-emerald-700">
                    {formatCurrency(row.profit, 2)}
                  </td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No records match your current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono tabular-nums">
            Page {safePage} of {totalPages} ({filteredRows.length} rows)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
