import React, { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Search, ArrowUpDown, Award, AlertTriangle } from 'lucide-react';
import type { AnalyticsSnapshot } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analyticsEngine';
import { baseCartesianOptions, CATEGORY_PALETTE, CHART_COLORS } from '../utils/chartSetup';

interface ProductAnalysisProps {
  snapshot: AnalyticsSnapshot;
}

type SortField = 'revenue' | 'profit' | 'units' | 'marginPct';

export const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ snapshot }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('revenue');
  const [sortDesc, setSortDesc] = useState(true);

  const { products, bestProducts, lowProducts, categories } = snapshot;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...products]
      .filter(
        (p) =>
          !q ||
          p.product.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return sortDesc ? -diff : diff;
      });
  }, [products, searchQuery, sortBy, sortDesc]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDesc((prev) => !prev);
    } else {
      setSortBy(field);
      setSortDesc(true);
    }
  };

  const bestChartData = {
    labels: bestProducts.map((p) => p.product),
    datasets: [
      {
        label: 'Revenue',
        data: bestProducts.map((p) => p.revenue),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 4,
        maxBarThickness: 24,
      },
      {
        label: 'Net Profit',
        data: bestProducts.map((p) => p.profit),
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 4,
        maxBarThickness: 24,
      },
    ],
  };

  const categoryBarData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Category Revenue',
        data: categories.map((c) => c.revenue),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 5,
        maxBarThickness: 36,
      },
      {
        label: 'Category Profit',
        data: categories.map((c) => c.profit),
        backgroundColor: CHART_COLORS.emerald,
        borderRadius: 5,
        maxBarThickness: 36,
      },
    ],
  };

  const categoryShareData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => c.revenue),
        backgroundColor: categories.map((_, idx) => CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]),
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Best-Selling vs Low-Performing Products */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Best-Selling Products (Top 5 by Revenue)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Revenue and net profit contribution of highest-performing SKUs
              </p>
            </div>
            <Award className="w-5 h-5 text-blue-600 shrink-0" />
          </div>
          <div className="h-[290px] w-full">
            <Bar
              data={bestChartData}
              options={{
                ...(baseCartesianOptions(true) as Record<string, unknown>),
                indexAxis: 'y' as const,
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
                    ticks: { color: '#1E293B', font: { size: 11, weight: 500 } },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Low-Performing Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bottom 5 products requiring promotion, bundling, or pricing review
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          </div>
          <div className="divide-y divide-slate-100">
            {lowProducts.map((p, idx) => (
              <div key={p.product} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {idx + 1}. {p.product}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.category} · {formatNumber(p.units)} units · {p.marginPct}% margin
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(p.revenue)}
                  </p>
                  <p className="text-xs font-mono text-amber-700 tabular-nums">
                    {formatCurrency(p.profit)} profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category-Wise Sales Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Category-Wise Sales & Profit Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Revenue and net profitability across product categories
            </p>
          </div>
          <div className="h-[280px] w-full">
            <Bar data={categoryBarData} options={baseCartesianOptions(true)} />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Category Share Mix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportional revenue distribution
            </p>
          </div>
          <div className="h-[180px] my-3">
            <Doughnut
              data={categoryShareData}
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
            {categories.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] }}
                  />
                  <span className="text-slate-700 truncate">{cat.category}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-900 font-medium shrink-0">
                  {cat.sharePct}% ({cat.marginPct}% margin)
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Product-Wise Revenue Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Product-Wise Revenue & Margin Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or category..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('units')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Units</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('revenue')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('profit')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Profit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 pl-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('marginPct')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Margin</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => (
                <tr key={p.product} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-semibold text-slate-900">{p.product}</td>
                  <td className="py-3 px-3 text-slate-600">{p.category}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatNumber(p.units)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    {formatCurrency(p.avgUnitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                    {formatCurrency(p.profit)}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums text-slate-700">
                    {p.marginPct}%
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No products match &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
