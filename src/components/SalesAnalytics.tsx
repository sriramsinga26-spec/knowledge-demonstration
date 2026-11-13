import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, BarChart2, Activity } from 'lucide-react';
import type { AnalyticsSnapshot } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { baseCartesianOptions, CHART_COLORS } from '../utils/chartSetup';

interface SalesAnalyticsProps {
  snapshot: AnalyticsSnapshot;
  selectedDailyMonth: string;
  onDailyMonthChange: (monthKey: string) => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  snapshot,
  selectedDailyMonth,
  onDailyMonthChange,
}) => {
  const [monthlyMetricMode, setMonthlyMetricMode] = useState<'financial' | 'volume'>('financial');

  const { monthly, yearly, daily, summary, availableMonths } = snapshot;

  const latestMonthlyGrowth =
    monthly.length > 0 && monthly[monthly.length - 1].growthPct !== null
      ? monthly[monthly.length - 1].growthPct!
      : summary.revenueGrowthPct;

  const avgMonthlyRevenue =
    monthly.length > 0 ? summary.totalRevenue / monthly.length : 0;

  const peakMonth =
    monthly.length > 0
      ? [...monthly].sort((a, b) => b.revenue - a.revenue)[0]
      : null;

  // Monthly Bar/Line Data
  const monthlyChartData =
    monthlyMetricMode === 'financial'
      ? {
          labels: monthly.map((m) => m.label),
          datasets: [
            {
              label: 'Monthly Revenue',
              data: monthly.map((m) => m.revenue),
              backgroundColor: CHART_COLORS.blue,
              borderRadius: 4,
              maxBarThickness: 28,
            },
            {
              label: 'Monthly Profit',
              data: monthly.map((m) => m.profit),
              backgroundColor: CHART_COLORS.navy,
              borderRadius: 4,
              maxBarThickness: 28,
            },
          ],
        }
      : {
          labels: monthly.map((m) => m.label),
          datasets: [
            {
              label: 'Units Sold',
              data: monthly.map((m) => m.units),
              backgroundColor: CHART_COLORS.blue,
              borderRadius: 4,
              maxBarThickness: 28,
            },
            {
              label: 'Order Count',
              data: monthly.map((m) => m.orders),
              backgroundColor: CHART_COLORS.sky,
              borderRadius: 4,
              maxBarThickness: 28,
            },
          ],
        };

  // Yearly Performance Data
  const yearlyChartData = {
    labels: yearly.map((y) => `FY ${y.year}`),
    datasets: [
      {
        label: 'Annual Revenue',
        data: yearly.map((y) => y.revenue),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 6,
        maxBarThickness: 48,
      },
      {
        label: 'Annual Profit',
        data: yearly.map((y) => y.profit),
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 6,
        maxBarThickness: 48,
      },
    ],
  };

  // Daily Sales Trend Line Data
  const dailyChartData = {
    labels: daily.map((d) => d.label),
    datasets: [
      {
        label: 'Daily Revenue',
        data: daily.map((d) => d.revenue),
        borderColor: CHART_COLORS.blue,
        backgroundColor: CHART_COLORS.blueFill,
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointBackgroundColor: CHART_COLORS.blue,
      },
      {
        label: 'Daily Profit',
        data: daily.map((d) => d.profit),
        borderColor: CHART_COLORS.emerald,
        backgroundColor: CHART_COLORS.emeraldFill,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS.emerald,
      },
    ],
  };

  // Monthly Growth Rate Line Data
  const growthSeries = monthly.filter((m) => m.growthPct !== null);
  const growthChartData = {
    labels: growthSeries.map((m) => m.label),
    datasets: [
      {
        label: 'MoM Revenue Growth %',
        data: growthSeries.map((m) => m.growthPct ?? 0),
        borderColor: CHART_COLORS.navy,
        backgroundColor: growthSeries.map((m) =>
          (m.growthPct ?? 0) >= 0 ? 'rgba(37, 99, 235, 0.78)' : 'rgba(220, 38, 38, 0.78)'
        ),
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Sales Analytics Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Sales Growth Rate (YoY)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p
            className={`font-display text-2xl font-bold tabular-nums ${
              summary.revenueGrowthPct >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {summary.revenueGrowthPct >= 0 ? '+' : ''}
            {summary.revenueGrowthPct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Latest period vs prior comparable year
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Latest Month Growth</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p
            className={`font-display text-2xl font-bold tabular-nums ${
              latestMonthlyGrowth >= 0 ? 'text-blue-700' : 'text-red-600'
            }`}
          >
            {latestMonthlyGrowth >= 0 ? '+' : ''}
            {latestMonthlyGrowth}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Month-over-month revenue delta
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Average Monthly Revenue</span>
            <BarChart2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(avgMonthlyRevenue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {monthly.length} recorded months
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Peak Sales Month</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {peakMonth ? formatCurrency(peakMonth.revenue) : '$0'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {peakMonth ? `${peakMonth.label} · ${peakMonth.orders} orders` : 'No data'}
          </p>
        </div>
      </div>

      {/* Monthly Sales Analysis */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Monthly Sales Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare monthly revenue & net profit or unit & order volume
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMonthlyMetricMode('financial')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                monthlyMetricMode === 'financial'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue & Profit
            </button>
            <button
              type="button"
              onClick={() => setMonthlyMetricMode('volume')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                monthlyMetricMode === 'volume'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Units & Orders
            </button>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <Bar
            data={monthlyChartData}
            options={baseCartesianOptions(monthlyMetricMode === 'financial')}
          />
        </div>
      </section>

      {/* Yearly Performance + Growth Percentage */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Yearly Sales Performance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual revenue, profit, and YoY expansion comparison
            </p>
          </div>
          <div className="h-[250px] w-full mb-5">
            <Bar data={yearlyChartData} options={baseCartesianOptions(true)} />
          </div>

          <div className="overflow-x-auto border-t border-slate-100 pt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">Year</th>
                  <th className="py-2 px-3 text-right font-semibold">Orders</th>
                  <th className="py-2 px-3 text-right font-semibold">Revenue</th>
                  <th className="py-2 px-3 text-right font-semibold">Profit</th>
                  <th className="py-2 pl-3 text-right font-semibold">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearly.map((y) => (
                  <tr key={y.year}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{y.year}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatNumber(y.orders)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                      {formatCurrency(y.revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatCurrency(y.profit)}
                    </td>
                    <td
                      className={`py-2.5 pl-3 text-right font-mono tabular-nums font-semibold ${
                        y.growthPct === null
                          ? 'text-slate-400'
                          : y.growthPct >= 0
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {y.growthPct === null
                        ? 'Baseline'
                        : `${y.growthPct >= 0 ? '+' : ''}${y.growthPct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Monthly Sales Growth Percentage
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Month-over-month percentage change in gross revenue
            </p>
          </div>
          <div className="h-[360px] w-full">
            <Bar
              data={growthChartData}
              options={{
                ...(baseCartesianOptions(false) as Record<string, unknown>),
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0B192C',
                    padding: 10,
                    callbacks: {
                      label: (ctx) =>
                        ` MoM Growth: ${Number(ctx.parsed.y) >= 0 ? '+' : ''}${ctx.parsed.y}%`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748B', font: { size: 11 } },
                  },
                  y: {
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    ticks: {
                      color: '#64748B',
                      font: { size: 11 },
                      callback: (val) => `${val}%`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* Daily Sales Trends */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Daily Sales Trends
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaction-by-transaction daily revenue and profit curve for selected month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="daily-month-select" className="text-xs font-medium text-slate-600">
              Month:
            </label>
            <select
              id="daily-month-select"
              value={selectedDailyMonth || availableMonths[0]?.key || ''}
              onChange={(e) => onDailyMonthChange(e.target.value)}
              className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-[290px] w-full">
          {daily.length > 0 ? (
            <Line
              data={dailyChartData}
              options={{
                ...(baseCartesianOptions(true) as Record<string, unknown>),
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No daily transaction records found for the selected filter.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
