import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Users, UserCheck, UserPlus, Repeat, Search } from 'lucide-react';
import type { AnalyticsSnapshot } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { baseCartesianOptions, CATEGORY_PALETTE, CHART_COLORS } from '../utils/chartSetup';

interface CustomerAnalysisProps {
  snapshot: AnalyticsSnapshot;
}

export const CustomerAnalysis: React.FC<CustomerAnalysisProps> = ({ snapshot }) => {
  const [segmentFilter, setSegmentFilter] = useState<'All' | 'Returning' | 'New'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    customers,
    customerTrends,
    totalCustomers,
    returningCustomerCount,
    newCustomerCount,
    repeatPurchaseRatePct,
    dayOfWeekPattern,
    regionBreakdown,
  } = snapshot;

  const topCustomers = customers.slice(0, 8);

  const filteredCustomers = customers.filter((c) => {
    const matchesSeg = segmentFilter === 'All' || c.segment === segmentFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q || c.customer.toLowerCase().includes(q) || c.region.toLowerCase().includes(q);
    return matchesSeg && matchesSearch;
  });

  // Top Customers Bar Chart
  const topCustomersChart = {
    labels: topCustomers.map((c) => c.customer),
    datasets: [
      {
        label: 'Total Spend',
        data: topCustomers.map((c) => c.totalSpend),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 4,
        maxBarThickness: 22,
      },
    ],
  };

  // New vs Returning Customers Over Time
  const recentTrends = customerTrends.slice(-12);
  const newVsReturningChart = {
    labels: recentTrends.map((t) => t.label),
    datasets: [
      {
        label: 'Returning Customers',
        data: recentTrends.map((t) => t.returningCustomers),
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 4,
      },
      {
        label: 'New Customers',
        data: recentTrends.map((t) => t.newCustomers),
        backgroundColor: CHART_COLORS.sky,
        borderRadius: 4,
      },
    ],
  };

  // Purchase Pattern by Weekday
  const weekdayChartData = {
    labels: dayOfWeekPattern.map((d) => d.day),
    datasets: [
      {
        label: 'Order Revenue',
        data: dayOfWeekPattern.map((d) => d.revenue),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 5,
        maxBarThickness: 32,
      },
    ],
  };

  // Regional Customer Distribution
  const regionChartData = {
    labels: regionBreakdown.map((r) => r.region),
    datasets: [
      {
        data: regionBreakdown.map((r) => r.revenue),
        backgroundColor: regionBreakdown.map((_, idx) => CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]),
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const avgSpendPerCustomer =
    totalCustomers > 0 ? snapshot.summary.totalRevenue / totalCustomers : 0;

  return (
    <div className="space-y-6">
      {/* Customer Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumber(totalCustomers)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Avg spend {formatCurrency(avgSpendPerCustomer)} per account
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Returning Customers</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumber(returningCustomerCount)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Accounts with 2+ completed orders
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>New Customers</span>
            <UserPlus className="w-4 h-4 text-sky-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumber(newCustomerCount)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            First-order acquisition accounts
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Repeat Purchase Rate</span>
            <Repeat className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-blue-700 tabular-nums">
            {repeatPurchaseRatePct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Share of returning vs total customers
          </p>
        </div>
      </div>

      {/* Top Customers & New vs Returning */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Top Customers by Lifetime Spend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Highest-value enterprise and commercial accounts
            </p>
          </div>
          <div className="h-[290px] w-full">
            <Bar
              data={topCustomersChart}
              options={{
                ...(baseCartesianOptions(true) as Record<string, unknown>),
                indexAxis: 'y' as const,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0B192C',
                    callbacks: {
                      label: (ctx) => ` Spend: ${formatCurrency(Number(ctx.parsed.x || 0))}`,
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    ticks: {
                      color: '#64748B',
                      font: { size: 11 },
                      callback: (v) => `$${(Number(v) / 1000).toFixed(0)}k`,
                    },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: '#1E293B', font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              New vs Returning Customers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly active buyer composition across the last {recentTrends.length} months
            </p>
          </div>
          <div className="h-[290px] w-full">
            <Bar
              data={newVsReturningChart}
              options={{
                ...(baseCartesianOptions(false) as Record<string, unknown>),
                scales: {
                  x: { stacked: true, grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    ticks: { color: '#64748B', font: { size: 11 }, stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* Customer Purchase Patterns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Customer Purchase Patterns by Weekday
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Purchasing cadence across days of the week
            </p>
          </div>
          <div className="h-[240px] w-full">
            <Bar data={weekdayChartData} options={baseCartesianOptions(true)} />
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Regional Purchasing Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Revenue concentration by geographic region
            </p>
          </div>
          <div className="h-[160px] my-3">
            <Doughnut
              data={regionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0B192C',
                    callbacks: {
                      label: (ctx) =>
                        ` ${ctx.label}: ${formatCurrency(Number(ctx.parsed || 0))}`,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {regionBreakdown.map((reg, idx) => (
              <div key={reg.region} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] }}
                  />
                  <span className="text-slate-700">{reg.region}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-medium">
                  {formatCurrency(reg.revenue)} · {reg.orders} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Directory Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Customer Account Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredCustomers.length} matching customer accounts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Returning', 'New'] as const).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSegmentFilter(seg)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    segmentFilter === seg
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer or region..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Customer Account</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">Avg Order Value</th>
                <th className="py-2.5 px-3 text-right">Total Spend</th>
                <th className="py-2.5 pl-3 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.customer} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-semibold text-slate-900">{c.customer}</td>
                  <td className="py-3 px-3 text-slate-600">{c.region}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-medium ${
                        c.segment === 'Returning' ? 'text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {c.orders}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrency(c.avgOrderValue)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(c.totalSpend)}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums text-slate-500">
                    {c.lastOrderDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
