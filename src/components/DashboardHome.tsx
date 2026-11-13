import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  PackageCheck,
  Wallet,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import type { AnalyticsSnapshot, NavSection, SalesRecord } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { baseCartesianOptions, CATEGORY_PALETTE, CHART_COLORS } from '../utils/chartSetup';

interface DashboardHomeProps {
  snapshot: AnalyticsSnapshot;
  records: SalesRecord[];
  onNavigate: (section: NavSection) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  snapshot,
  records,
  onNavigate,
}) => {
  const { summary, monthly, categories, insights } = snapshot;

  const recentMonths = monthly.slice(-12);

  const revenueProfitChartData = {
    labels: recentMonths.map((m) => m.label),
    datasets: [
      {
        label: 'Revenue',
        data: recentMonths.map((m) => m.revenue),
        borderColor: CHART_COLORS.blue,
        backgroundColor: CHART_COLORS.blueFill,
        fill: true,
        tension: 0.32,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_COLORS.blue,
      },
      {
        label: 'Net Profit',
        data: recentMonths.map((m) => m.profit),
        borderColor: CHART_COLORS.navy,
        backgroundColor: 'rgba(11, 25, 44, 0.06)',
        fill: false,
        tension: 0.32,
        borderWidth: 2,
        borderDash: [4, 3],
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_COLORS.navy,
      },
    ],
  };

  const categoryChartData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Revenue Share',
        data: categories.map((c) => c.revenue),
        backgroundColor: categories.map((_, idx) => CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const kpiCards = [
    {
      label: 'Total Sales',
      value: formatNumber(summary.totalSalesUnits),
      subtext: 'Units sold across periods',
      delta: `${summary.ordersGrowthPct >= 0 ? '+' : ''}${summary.ordersGrowthPct}% YoY`,
      positive: summary.ordersGrowthPct >= 0,
      icon: PackageCheck,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      subtext: 'Gross recognized sales',
      delta: `${summary.revenueGrowthPct >= 0 ? '+' : ''}${summary.revenueGrowthPct}% YoY`,
      positive: summary.revenueGrowthPct >= 0,
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: formatNumber(summary.totalOrders),
      subtext: `${snapshot.totalCustomers} active accounts`,
      delta: `${summary.ordersGrowthPct >= 0 ? '+' : ''}${summary.ordersGrowthPct}% YoY`,
      positive: summary.ordersGrowthPct >= 0,
      icon: ShoppingCart,
    },
    {
      label: 'Total Profit',
      value: formatCurrency(summary.totalProfit),
      subtext: `${summary.profitMarginPct}% overall net margin`,
      delta: `${summary.profitGrowthPct >= 0 ? '+' : ''}${summary.profitGrowthPct}% YoY`,
      positive: summary.profitGrowthPct >= 0,
      icon: Wallet,
    },
    {
      label: 'Average Order Value',
      value: formatCurrency(summary.averageOrderValue, 2),
      subtext: 'Mean revenue per order',
      delta: `${summary.profitMarginPct}% margin`,
      positive: true,
      icon: Receipt,
    },
  ];

  const recentOrders = records.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* 5 Summary KPI Cards */}
      <section aria-label="Executive Sales Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {kpi.value}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 truncate">{kpi.subtext}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono font-medium tabular-nums shrink-0 ${
                        kpi.positive ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {kpi.positive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {kpi.delta}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue vs Profit Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Revenue & Net Profit Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last {recentMonths.length} active months · Interactive Chart.js overview
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
            >
              <span>Detailed Sales Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <Line
              data={revenueProfitChartData}
              options={{
                ...(baseCartesianOptions(true) as Record<string, unknown>),
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Category Breakdown Doughnut */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Revenue by Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {categories.length} active product lines
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '64%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0B192C',
                    padding: 10,
                    callbacks: {
                      label: (ctx) =>
                        ` ${ctx.label}: ${formatCurrency(Number(ctx.parsed || 0))}`,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] }}
                  />
                  <span className="text-slate-700 truncate">{cat.category}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-medium shrink-0">
                  {cat.sharePct}% · {formatCurrency(cat.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Row: Key Automated Insights + Recent Orders Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Automated Business Highlights
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed directly from active sales records
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('insights')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>All Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {insights.slice(0, 4).map((item) => (
              <div key={item.id} className="py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-semibold text-blue-700">{item.title}</span>
                  <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                    {item.metricValue}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">{item.headline}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Recent Sales Transactions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest {recentOrders.length} orders · Use Upload Dataset to inspect full ledger
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Explore All Data</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 pl-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOrders.map((row) => (
                  <tr key={`${row.orderId}-${row.date}-${row.product}`} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {row.orderId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[180px] truncate">
                      {row.product}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate">
                      {row.customer}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.quantity}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
