import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Lightbulb, TrendingUp, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import type { AnalyticsSnapshot, NavSection } from '../types/sales';
import { formatCurrency } from '../utils/analyticsEngine';
import { baseCartesianOptions, CHART_COLORS } from '../utils/chartSetup';

interface BusinessInsightsProps {
  snapshot: AnalyticsSnapshot;
  datasetName: string;
  onNavigate: (section: NavSection) => void;
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({
  snapshot,
  datasetName,
  onNavigate,
}) => {
  const { insights, recommendations, categories, summary } = snapshot;

  const categoryMarginChart = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Profit Margin %',
        data: categories.map((c) => c.marginPct),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 5,
        maxBarThickness: 36,
      },
      {
        label: 'Revenue Share %',
        data: categories.map((c) => c.sharePct),
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 5,
        maxBarThickness: 36,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <section className="bg-[#0B192C] text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-300 mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>Automated Analytical Engine · {datasetName}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Executive Business Insights & Strategic Recommendations
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Every finding below is calculated programmatically from {summary.totalOrders.toLocaleString()} orders totaling {formatCurrency(summary.totalRevenue)} in revenue and {formatCurrency(summary.totalProfit)} in net profit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Generate Downloadable Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Automatically Generated Key Insights */}
      <section aria-label="Automated Business Insights">
        <div className="mb-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            Key Performance Findings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically extracted highlights across time periods, products, categories, and customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {insights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-700">
                    {item.title}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      item.impact === 'Positive'
                        ? 'text-emerald-700'
                        : item.impact === 'Opportunity'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {item.headline}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{item.metricLabel}</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {item.metricValue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Margin vs Revenue Share Visual + Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Category Margin vs Revenue Share
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identify high-margin categories ripe for growth investment
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="h-[320px] w-full">
            <Bar
              data={categoryMarginChart}
              options={{
                ...(baseCartesianOptions(false) as Record<string, unknown>),
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748B', font: { size: 11 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    ticks: {
                      color: '#64748B',
                      font: { size: 11 },
                      callback: (v) => `${v}%`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Suggestions to Improve Business Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized actions derived from product velocity, margins, and retention data
              </p>
            </div>
            <Target className="w-4 h-4 text-blue-600 shrink-0" />
          </div>

          <div className="divide-y divide-slate-100">
            {recommendations.map((rec) => (
              <div key={rec.id} className="py-4 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{rec.area}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className={`font-semibold ${
                        rec.priority === 'High'
                          ? 'text-blue-700'
                          : rec.priority === 'Medium'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.rationale}</p>
                <div className="mt-2 flex items-start gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Expected Impact: {rec.expectedOutcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
