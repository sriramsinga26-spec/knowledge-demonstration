export interface SalesRecord {
  orderId: string;
  date: string; // ISO YYYY-MM-DD
  product: string;
  category: string;
  customer: string;
  region: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
  profit: number;
  paymentMethod?: string;
}

export type NavSection =
  | 'home'
  | 'sales'
  | 'products'
  | 'customers'
  | 'insights'
  | 'upload'
  | 'reports';

export interface SummaryMetrics {
  totalSalesUnits: number;
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  averageOrderValue: number;
  profitMarginPct: number;
  revenueGrowthPct: number;
  ordersGrowthPct: number;
  profitGrowthPct: number;
}

export interface MonthlyMetric {
  monthKey: string; // YYYY-MM
  label: string; // e.g., "Jan 2026"
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  growthPct: number | null;
}

export interface YearlyMetric {
  year: string;
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  marginPct: number;
  growthPct: number | null;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  label: string;
  revenue: number;
  profit: number;
  orders: number;
  units: number;
}

export interface ProductMetric {
  product: string;
  category: string;
  units: number;
  orders: number;
  revenue: number;
  profit: number;
  marginPct: number;
  avgUnitPrice: number;
}

export interface CategoryMetric {
  category: string;
  revenue: number;
  profit: number;
  units: number;
  orders: number;
  sharePct: number;
  marginPct: number;
}

export interface CustomerMetric {
  customer: string;
  region: string;
  orders: number;
  units: number;
  totalSpend: number;
  totalProfit: number;
  avgOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  segment: 'Returning' | 'New';
}

export interface CustomerTrendPoint {
  monthKey: string;
  label: string;
  newCustomers: number;
  returningCustomers: number;
  newRevenue: number;
  returningRevenue: number;
}

export interface BusinessInsightItem {
  id: string;
  title: string;
  headline: string;
  detail: string;
  impact: 'Positive' | 'Opportunity' | 'Attention';
  metricLabel: string;
  metricValue: string;
}

export interface RecommendationItem {
  id: string;
  priority: 'High' | 'Medium' | 'Strategic';
  area: string;
  title: string;
  rationale: string;
  expectedOutcome: string;
}

export interface AnalyticsSnapshot {
  summary: SummaryMetrics;
  monthly: MonthlyMetric[];
  yearly: YearlyMetric[];
  daily: DailyMetric[];
  products: ProductMetric[];
  bestProducts: ProductMetric[];
  lowProducts: ProductMetric[];
  categories: CategoryMetric[];
  customers: CustomerMetric[];
  customerTrends: CustomerTrendPoint[];
  totalCustomers: number;
  returningCustomerCount: number;
  newCustomerCount: number;
  repeatPurchaseRatePct: number;
  dayOfWeekPattern: { day: string; orders: number; revenue: number }[];
  regionBreakdown: { region: string; revenue: number; profit: number; orders: number }[];
  insights: BusinessInsightItem[];
  recommendations: RecommendationItem[];
  availableYears: string[];
  availableCategories: string[];
  availableMonths: { key: string; label: string }[];
}
