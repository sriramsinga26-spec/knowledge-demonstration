import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.font.family = '"DM Sans", ui-sans-serif, system-ui, sans-serif';
ChartJS.defaults.color = '#475569';
ChartJS.defaults.borderColor = '#e2e8f0';

export const CHART_COLORS = {
  navy: '#0B192C',
  navySoft: 'rgba(11, 25, 44, 0.85)',
  blue: '#2563EB',
  blueFill: 'rgba(37, 99, 235, 0.14)',
  sky: '#0EA5E9',
  skyFill: 'rgba(14, 165, 233, 0.16)',
  indigo: '#4F46E5',
  emerald: '#059669',
  emeraldFill: 'rgba(5, 150, 105, 0.14)',
  amber: '#D97706',
  slate: '#64748B',
  crimson: '#DC2626',
};

export const CATEGORY_PALETTE = [
  '#2563EB',
  '#0B192C',
  '#0EA5E9',
  '#059669',
  '#4F46E5',
  '#D97706',
  '#64748B',
];

export const baseCartesianOptions = (currency = true): ChartOptions<'bar'> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        color: '#334155',
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: '#0B192C',
      titleColor: '#F8FAFC',
      bodyColor: '#E2E8F0',
      borderColor: '#1E293B',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 12, weight: 600 },
      bodyFont: { size: 12 },
      callbacks: currency
        ? {
            label: (ctx) => {
              const val = Number(ctx.parsed.y ?? ctx.parsed.x ?? 0);
              return ` ${ctx.dataset.label}: $${val.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}`;
            },
          }
        : undefined,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748B',
        font: { size: 11 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F1F5F9',
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        callback: currency
          ? (value) => {
              const num = Number(value);
              if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
              return `$${num}`;
            }
          : undefined,
      },
    },
  },
});
