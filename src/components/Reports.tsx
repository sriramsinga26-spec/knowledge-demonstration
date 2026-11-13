import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Download, FileSpreadsheet, Printer, FileText } from 'lucide-react';
import type { AnalyticsSnapshot } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { baseCartesianOptions, CHART_COLORS } from '../utils/chartSetup';
import { exportAnalyticsCsv, exportAnalyticsExcel } from '../utils/datasetIO';

interface ReportsProps {
  snapshot: AnalyticsSnapshot;
  datasetName: string;
  yearFilter: string;
  categoryFilter: string;
}

type ReportScope = 'comprehensive' | 'sales' | 'products' | 'customers';

export const Reports: React.FC<ReportsProps> = ({
  snapshot,
  datasetName,
  yearFilter,
  categoryFilter,
}) => {
  const [scope, setScope] = useState<ReportScope>('comprehensive');

  const { summary, monthly, categories, bestProducts, customers, insights } = snapshot;

  const monthlyTrendData = {
    labels: monthly.slice(-12).map((m) => m.label),
    datasets: [
      {
        label: 'Revenue',
        data: monthly.slice(-12).map((m) => m.revenue),
        borderColor: CHART_COLORS.blue,
        backgroundColor: CHART_COLORS.blueFill,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: 'Profit',
        data: monthly.slice(-12).map((m) => m.profit),
        borderColor: CHART_COLORS.navy,
        backgroundColor: 'rgba(11, 25, 44, 0.08)',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };

  const categoryPerformanceData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Revenue',
        data: categories.map((c) => c.revenue),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 4,
        maxBarThickness: 32,
      },
      {
        label: 'Net Profit',
        data: categories.map((c) => c.profit),
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 4,
        maxBarThickness: 32,
      },
    ],
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration & Download Bar */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Generate & Download Analytical Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select report scope and export graphical summaries as Excel (.xlsx), CSV, or Print/PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'comprehensive', label: 'Full Report' },
                { id: 'sales', label: 'Sales' },
                { id: 'products', label: 'Products' },
                { id: 'customers', label: 'Customers' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScope(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  scope === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => exportAnalyticsExcel(snapshot, datasetName)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => exportAnalyticsCsv(snapshot, datasetName)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </section>

      {/* Printable Graphical Report Sheet */}
      <article className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-8">
        {/* Report Title Header */}
        <header className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1.5">
              <FileText className="w-4 h-4" />
              <span>Executive Business Report</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Sales Data Analysis & Performance Report
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dataset: {datasetName} · Year Scope: {yearFilter} · Category Scope: {categoryFilter}
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
            <p>Generated: {new Date().toISOString().slice(0, 10)}</p>
            <p className="mt-0.5 text-slate-700 font-semibold">
              {formatNumber(summary.totalOrders)} Orders Analyzed
            </p>
          </div>
        </header>

        {/* Executive KPI Summary Strip */}
        <section className="print-break-inside-avoid">
          <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
            1. Executive Financial Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] text-slate-500 font-medium">Total Sales (Units)</p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {formatNumber(summary.totalSalesUnits)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] text-slate-500 font-medium">Total Revenue</p>
              <p className="font-display text-lg font-bold text-blue-700 tabular-nums mt-0.5">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] text-slate-500 font-medium">Total Profit</p>
              <p className="font-display text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                {formatCurrency(summary.totalProfit)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] text-slate-500 font-medium">Average Order Value</p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {formatCurrency(summary.averageOrderValue, 2)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-500 font-medium">Net Profit Margin</p>
              <p className="font-display text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {summary.profitMarginPct}%
              </p>
            </div>
          </div>
        </section>

        {/* Graphical Charts Section */}
        {(scope === 'comprehensive' || scope === 'sales' || scope === 'products') && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-inside-avoid">
            {(scope === 'comprehensive' || scope === 'sales') && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
                  2. Monthly Revenue & Profit Graphical Trend
                </h4>
                <div className="h-[240px] w-full">
                  <Line
                    data={monthlyTrendData}
                    options={{
                      ...(baseCartesianOptions(true) as Record<string, unknown>),
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            )}

            {(scope === 'comprehensive' || scope === 'products') && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
                  {scope === 'products' ? '2.' : '3.'} Category Revenue & Profit Comparison
                </h4>
                <div className="h-[240px] w-full">
                  <Bar data={categoryPerformanceData} options={baseCartesianOptions(true)} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Top Products Table */}
        {(scope === 'comprehensive' || scope === 'products') && (
          <section className="print-break-inside-avoid">
            <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
              Top Performing Products Summary
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Units Sold</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-right">Profit</th>
                    <th className="py-2 pl-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestProducts.map((p) => (
                    <tr key={p.product}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">{p.product}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatNumber(p.units)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                        {formatCurrency(p.revenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                        {formatCurrency(p.profit)}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-slate-700">
                        {p.marginPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Top Customers Table */}
        {(scope === 'comprehensive' || scope === 'customers') && (
          <section className="print-break-inside-avoid">
            <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
              Top Customer Accounts & Retention Summary
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 px-3">Region</th>
                    <th className="py-2 px-3">Segment</th>
                    <th className="py-2 px-3 text-right">Orders</th>
                    <th className="py-2 px-3 text-right">Total Spend</th>
                    <th className="py-2 pl-3 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.slice(0, 6).map((c) => (
                    <tr key={c.customer}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">{c.customer}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.region}</td>
                      <td className="py-2.5 px-3 text-slate-700">{c.segment}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {c.orders}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                        {formatCurrency(c.totalSpend)}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-emerald-700">
                        {formatCurrency(c.totalProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Automated Key Takeaways */}
        <section className="border-t border-slate-200 pt-6 print-break-inside-avoid">
          <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
            Automated Executive Takeaways
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(0, 4).map((ins) => (
              <div key={ins.id} className="rounded-lg border border-slate-200 p-3.5">
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-blue-700">{ins.title}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {ins.metricValue}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900">{ins.headline}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ins.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};
