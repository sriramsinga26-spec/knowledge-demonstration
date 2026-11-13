import type {
  AnalyticsSnapshot,
  BusinessInsightItem,
  CategoryMetric,
  CustomerMetric,
  CustomerTrendPoint,
  DailyMetric,
  MonthlyMetric,
  ProductMetric,
  RecommendationItem,
  SalesRecord,
  YearlyMetric,
} from '../types/sales';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const idx = Number(m) - 1;
  if (idx >= 0 && idx < 12) {
    return `${MONTH_SHORT[idx]} ${y}`;
  }
  return monthKey;
}

export function computeAnalytics(
  allRecords: SalesRecord[],
  yearFilter: string = 'All',
  categoryFilter: string = 'All',
  dailyMonthKey?: string
): AnalyticsSnapshot {
  const availableYears = Array.from(
    new Set(allRecords.map((r) => r.date.slice(0, 4)).filter((y) => /^\d{4}$/.test(y)))
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set(allRecords.map((r) => r.category).filter(Boolean))
  ).sort();

  const filtered = allRecords.filter((r) => {
    const matchYear = yearFilter === 'All' || r.date.startsWith(yearFilter);
    const matchCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchYear && matchCategory;
  });

  // Summary metrics
  const totalSalesUnits = filtered.reduce((sum, r) => sum + r.quantity, 0);
  const totalRevenue = filtered.reduce((sum, r) => sum + r.revenue, 0);
  const totalProfit = filtered.reduce((sum, r) => sum + r.profit, 0);
  const uniqueOrders = new Set(filtered.map((r) => r.orderId)).size || filtered.length;
  const averageOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
  const profitMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Monthly grouping
  const monthMap = new Map<
    string,
    { revenue: number; profit: number; orders: Set<string>; units: number }
  >();
  for (const r of filtered) {
    const mk = r.date.slice(0, 7);
    if (!monthMap.has(mk)) {
      monthMap.set(mk, { revenue: 0, profit: 0, orders: new Set(), units: 0 });
    }
    const bucket = monthMap.get(mk)!;
    bucket.revenue += r.revenue;
    bucket.profit += r.profit;
    bucket.orders.add(r.orderId);
    bucket.units += r.quantity;
  }

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();
  const monthly: MonthlyMetric[] = sortedMonthKeys.map((mk, idx) => {
    const b = monthMap.get(mk)!;
    const prevRevenue = idx > 0 ? monthMap.get(sortedMonthKeys[idx - 1])!.revenue : 0;
    const growthPct =
      idx > 0 && prevRevenue > 0 ? ((b.revenue - prevRevenue) / prevRevenue) * 100 : null;
    return {
      monthKey: mk,
      label: formatMonthLabel(mk),
      revenue: Number(b.revenue.toFixed(2)),
      profit: Number(b.profit.toFixed(2)),
      orders: b.orders.size,
      units: b.units,
      growthPct: growthPct !== null ? Number(growthPct.toFixed(1)) : null,
    };
  });

  const availableMonths = [...monthly]
    .reverse()
    .map((m) => ({ key: m.monthKey, label: m.label }));

  // Yearly grouping
  const yearMap = new Map<
    string,
    { revenue: number; profit: number; orders: Set<string>; units: number }
  >();
  for (const r of filtered) {
    const yk = r.date.slice(0, 4);
    if (!yearMap.has(yk)) {
      yearMap.set(yk, { revenue: 0, profit: 0, orders: new Set(), units: 0 });
    }
    const bucket = yearMap.get(yk)!;
    bucket.revenue += r.revenue;
    bucket.profit += r.profit;
    bucket.orders.add(r.orderId);
    bucket.units += r.quantity;
  }

  const sortedYearKeys = Array.from(yearMap.keys()).sort();
  const yearly: YearlyMetric[] = sortedYearKeys.map((yk, idx) => {
    const b = yearMap.get(yk)!;
    const prevRev = idx > 0 ? yearMap.get(sortedYearKeys[idx - 1])!.revenue : 0;
    const growthPct = idx > 0 && prevRev > 0 ? ((b.revenue - prevRev) / prevRev) * 100 : null;
    return {
      year: yk,
      revenue: Number(b.revenue.toFixed(2)),
      profit: Number(b.profit.toFixed(2)),
      orders: b.orders.size,
      units: b.units,
      marginPct: b.revenue > 0 ? Number(((b.profit / b.revenue) * 100).toFixed(1)) : 0,
      growthPct: growthPct !== null ? Number(growthPct.toFixed(1)) : null,
    };
  });

  // Period-over-period growth for KPI cards (compare second half vs first half of sorted months or latest 2 years)
  let revenueGrowthPct = 0;
  let ordersGrowthPct = 0;
  let profitGrowthPct = 0;

  if (yearly.length >= 2) {
    const latest = yearly[yearly.length - 1];
    const prev = yearly[yearly.length - 2];
    revenueGrowthPct = prev.revenue > 0 ? ((latest.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    ordersGrowthPct = prev.orders > 0 ? ((latest.orders - prev.orders) / prev.orders) * 100 : 0;
    profitGrowthPct = prev.profit > 0 ? ((latest.profit - prev.profit) / prev.profit) * 100 : 0;
  } else if (monthly.length >= 2) {
    const latest = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    revenueGrowthPct = prev.revenue > 0 ? ((latest.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    ordersGrowthPct = prev.orders > 0 ? ((latest.orders - prev.orders) / prev.orders) * 100 : 0;
    profitGrowthPct = prev.profit > 0 ? ((latest.profit - prev.profit) / prev.profit) * 100 : 0;
  }

  // Daily trends (for chosen month or latest month with data)
  const targetDailyMonth =
    dailyMonthKey && monthMap.has(dailyMonthKey)
      ? dailyMonthKey
      : sortedMonthKeys[sortedMonthKeys.length - 1] ?? '';

  const dayMap = new Map<
    string,
    { revenue: number; profit: number; orders: Set<string>; units: number }
  >();
  for (const r of filtered) {
    if (targetDailyMonth && !r.date.startsWith(targetDailyMonth)) continue;
    if (!dayMap.has(r.date)) {
      dayMap.set(r.date, { revenue: 0, profit: 0, orders: new Set(), units: 0 });
    }
    const b = dayMap.get(r.date)!;
    b.revenue += r.revenue;
    b.profit += r.profit;
    b.orders.add(r.orderId);
    b.units += r.quantity;
  }

  const daily: DailyMetric[] = Array.from(dayMap.keys())
    .sort()
    .map((dk) => {
      const b = dayMap.get(dk)!;
      const [, m, d] = dk.split('-');
      return {
        date: dk,
        label: `${MONTH_SHORT[Number(m) - 1] ?? m} ${Number(d)}`,
        revenue: Number(b.revenue.toFixed(2)),
        profit: Number(b.profit.toFixed(2)),
        orders: b.orders.size,
        units: b.units,
      };
    });

  // Product grouping
  const prodMap = new Map<
    string,
    { category: string; units: number; orders: Set<string>; revenue: number; profit: number }
  >();
  for (const r of filtered) {
    if (!prodMap.has(r.product)) {
      prodMap.set(r.product, {
        category: r.category,
        units: 0,
        orders: new Set(),
        revenue: 0,
        profit: 0,
      });
    }
    const b = prodMap.get(r.product)!;
    b.units += r.quantity;
    b.orders.add(r.orderId);
    b.revenue += r.revenue;
    b.profit += r.profit;
  }

  const products: ProductMetric[] = Array.from(prodMap.entries())
    .map(([product, b]) => ({
      product,
      category: b.category,
      units: b.units,
      orders: b.orders.size,
      revenue: Number(b.revenue.toFixed(2)),
      profit: Number(b.profit.toFixed(2)),
      marginPct: b.revenue > 0 ? Number(((b.profit / b.revenue) * 100).toFixed(1)) : 0,
      avgUnitPrice: b.units > 0 ? Number((b.revenue / b.units).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const bestProducts = products.slice(0, 5);
  const lowProducts = [...products].sort((a, b) => a.revenue - b.revenue).slice(0, 5);

  // Category grouping
  const catMap = new Map<
    string,
    { revenue: number; profit: number; units: number; orders: Set<string> }
  >();
  for (const r of filtered) {
    if (!catMap.has(r.category)) {
      catMap.set(r.category, { revenue: 0, profit: 0, units: 0, orders: new Set() });
    }
    const b = catMap.get(r.category)!;
    b.revenue += r.revenue;
    b.profit += r.profit;
    b.units += r.quantity;
    b.orders.add(r.orderId);
  }

  const categories: CategoryMetric[] = Array.from(catMap.entries())
    .map(([category, b]) => ({
      category,
      revenue: Number(b.revenue.toFixed(2)),
      profit: Number(b.profit.toFixed(2)),
      units: b.units,
      orders: b.orders.size,
      sharePct: totalRevenue > 0 ? Number(((b.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      marginPct: b.revenue > 0 ? Number(((b.profit / b.revenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Customer grouping & New vs Returning
  // Compute each customer's global first order date across the filtered dataset
  const custMap = new Map<
    string,
    {
      region: string;
      orders: Set<string>;
      units: number;
      totalSpend: number;
      totalProfit: number;
      firstOrderDate: string;
      lastOrderDate: string;
    }
  >();

  for (const r of filtered) {
    if (!custMap.has(r.customer)) {
      custMap.set(r.customer, {
        region: r.region,
        orders: new Set(),
        units: 0,
        totalSpend: 0,
        totalProfit: 0,
        firstOrderDate: r.date,
        lastOrderDate: r.date,
      });
    }
    const b = custMap.get(r.customer)!;
    b.orders.add(r.orderId);
    b.units += r.quantity;
    b.totalSpend += r.revenue;
    b.totalProfit += r.profit;
    if (r.date < b.firstOrderDate) b.firstOrderDate = r.date;
    if (r.date > b.lastOrderDate) b.lastOrderDate = r.date;
  }

  const customers: CustomerMetric[] = Array.from(custMap.entries())
    .map(([customer, b]) => {
      const orderCount = b.orders.size;
      return {
        customer,
        region: b.region,
        orders: orderCount,
        units: b.units,
        totalSpend: Number(b.totalSpend.toFixed(2)),
        totalProfit: Number(b.totalProfit.toFixed(2)),
        avgOrderValue: orderCount > 0 ? Number((b.totalSpend / orderCount).toFixed(2)) : 0,
        firstOrderDate: b.firstOrderDate,
        lastOrderDate: b.lastOrderDate,
        segment: (orderCount > 1 ? 'Returning' : 'New') as 'Returning' | 'New',
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);

  const totalCustomers = customers.length;
  const returningCustomerCount = customers.filter((c) => c.segment === 'Returning').length;
  const newCustomerCount = totalCustomers - returningCustomerCount;
  const repeatPurchaseRatePct =
    totalCustomers > 0 ? Number(((returningCustomerCount / totalCustomers) * 100).toFixed(1)) : 0;

  // Monthly New vs Returning trend
  const firstMonthByCustomer = new Map<string, string>();
  for (const c of customers) {
    firstMonthByCustomer.set(c.customer, c.firstOrderDate.slice(0, 7));
  }

  const custTrendMap = new Map<
    string,
    { newSet: Set<string>; retSet: Set<string>; newRev: number; retRev: number }
  >();
  for (const mk of sortedMonthKeys) {
    custTrendMap.set(mk, { newSet: new Set(), retSet: new Set(), newRev: 0, retRev: 0 });
  }
  for (const r of filtered) {
    const mk = r.date.slice(0, 7);
    const bucket = custTrendMap.get(mk);
    if (!bucket) continue;
    const isFirstMonth = firstMonthByCustomer.get(r.customer) === mk;
    if (isFirstMonth) {
      bucket.newSet.add(r.customer);
      bucket.newRev += r.revenue;
    } else {
      bucket.retSet.add(r.customer);
      bucket.retRev += r.revenue;
    }
  }

  const customerTrends: CustomerTrendPoint[] = sortedMonthKeys.map((mk) => {
    const b = custTrendMap.get(mk)!;
    return {
      monthKey: mk,
      label: formatMonthLabel(mk),
      newCustomers: b.newSet.size,
      returningCustomers: b.retSet.size,
      newRevenue: Number(b.newRev.toFixed(2)),
      returningRevenue: Number(b.retRev.toFixed(2)),
    };
  });

  // Day of week pattern
  const dowStats = WEEKDAYS.map((day) => ({ day, orders: new Set<string>(), revenue: 0 }));
  for (const r of filtered) {
    const parsed = new Date(`${r.date}T12:00:00`);
    const idx = Number.isNaN(parsed.getTime()) ? 1 : parsed.getDay();
    dowStats[idx].orders.add(r.orderId);
    dowStats[idx].revenue += r.revenue;
  }
  const dayOfWeekPattern = dowStats.map((d) => ({
    day: d.day,
    orders: d.orders.size,
    revenue: Number(d.revenue.toFixed(2)),
  }));

  // Region breakdown
  const regMap = new Map<string, { revenue: number; profit: number; orders: Set<string> }>();
  for (const r of filtered) {
    const reg = r.region || 'General';
    if (!regMap.has(reg)) {
      regMap.set(reg, { revenue: 0, profit: 0, orders: new Set() });
    }
    const b = regMap.get(reg)!;
    b.revenue += r.revenue;
    b.profit += r.profit;
    b.orders.add(r.orderId);
  }
  const regionBreakdown = Array.from(regMap.entries())
    .map(([region, b]) => ({
      region,
      revenue: Number(b.revenue.toFixed(2)),
      profit: Number(b.profit.toFixed(2)),
      orders: b.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Automated Business Insights Generation
  const insights: BusinessInsightItem[] = [];
  const recommendations: RecommendationItem[] = [];

  if (monthly.length > 0) {
    const bestMonth = [...monthly].sort((a, b) => b.revenue - a.revenue)[0];
    const avgMonthlyRev = totalRevenue / monthly.length;
    const aboveAvgPct =
      avgMonthlyRev > 0 ? ((bestMonth.revenue - avgMonthlyRev) / avgMonthlyRev) * 100 : 0;

    insights.push({
      id: 'best-month',
      title: 'Best-Performing Month',
      headline: `${bestMonth.label} led all periods with ${formatCurrency(bestMonth.revenue)}`,
      detail: `Generated ${formatCurrency(bestMonth.profit)} in profit across ${bestMonth.orders} orders (${aboveAvgPct.toFixed(1)}% above the ${formatCurrency(avgMonthlyRev)} monthly average).`,
      impact: 'Positive',
      metricLabel: 'Peak Month Revenue',
      metricValue: formatCurrency(bestMonth.revenue),
    });
  }

  if (products.length > 0) {
    const topByRev = products[0];
    const topByUnits = [...products].sort((a, b) => b.units - a.units)[0];
    insights.push({
      id: 'top-product',
      title: 'Highest-Selling Product',
      headline: `${topByRev.product} is the top revenue driver`,
      detail: `Contributed ${formatCurrency(topByRev.revenue)} (${((topByRev.revenue / (totalRevenue || 1)) * 100).toFixed(1)}% of total revenue) with ${formatNumber(topByRev.units)} units sold. By unit volume, ${topByUnits.product} led with ${formatNumber(topByUnits.units)} units.`,
      impact: 'Positive',
      metricLabel: 'Top SKU Revenue',
      metricValue: formatCurrency(topByRev.revenue),
    });
  }

  if (categories.length > 0) {
    const topProfitCat = [...categories].sort((a, b) => b.profit - a.profit)[0];
    const highestMarginCat = [...categories].sort((a, b) => b.marginPct - a.marginPct)[0];
    insights.push({
      id: 'profitable-category',
      title: 'Most Profitable Category',
      headline: `${topProfitCat.category} delivered ${formatCurrency(topProfitCat.profit)} in net profit`,
      detail: `Maintains a ${topProfitCat.marginPct.toFixed(1)}% profit margin across ${topProfitCat.orders} orders. Highest margin efficiency belongs to ${highestMarginCat.category} at ${highestMarginCat.marginPct.toFixed(1)}%.`,
      impact: 'Positive',
      metricLabel: 'Category Net Profit',
      metricValue: formatCurrency(topProfitCat.profit),
    });
  }

  if (yearly.length >= 2) {
    const latestYear = yearly[yearly.length - 1];
    const prevYear = yearly[yearly.length - 2];
    const yoyRev =
      prevYear.revenue > 0 ? ((latestYear.revenue - prevYear.revenue) / prevYear.revenue) * 100 : 0;
    insights.push({
      id: 'growth-trend',
      title: 'Sales Growth Trajectory',
      headline: `${yoyRev >= 0 ? '+' : ''}${yoyRev.toFixed(1)}% revenue shift from ${prevYear.year} to ${latestYear.year}`,
      detail: `${latestYear.year} reached ${formatCurrency(latestYear.revenue)} across ${latestYear.orders} orders compared to ${formatCurrency(prevYear.revenue)} in ${prevYear.year}.`,
      impact: yoyRev >= 0 ? 'Positive' : 'Attention',
      metricLabel: 'YoY Revenue Growth',
      metricValue: `${yoyRev >= 0 ? '+' : ''}${yoyRev.toFixed(1)}%`,
    });
  } else if (monthly.length >= 2) {
    const latestM = monthly[monthly.length - 1];
    const firstM = monthly[0];
    const spanGrowth =
      firstM.revenue > 0 ? ((latestM.revenue - firstM.revenue) / firstM.revenue) * 100 : 0;
    insights.push({
      id: 'growth-trend',
      title: 'Sales Growth Trajectory',
      headline: `${spanGrowth >= 0 ? '+' : ''}${spanGrowth.toFixed(1)}% change across observed months`,
      detail: `Revenue moved from ${formatCurrency(firstM.revenue)} in ${firstM.label} to ${formatCurrency(latestM.revenue)} in ${latestM.label}.`,
      impact: spanGrowth >= 0 ? 'Positive' : 'Attention',
      metricLabel: 'Period Growth',
      metricValue: `${spanGrowth >= 0 ? '+' : ''}${spanGrowth.toFixed(1)}%`,
    });
  }

  if (customers.length > 0) {
    const topCust = customers[0];
    const topCustShare = totalRevenue > 0 ? (topCust.totalSpend / totalRevenue) * 100 : 0;
    insights.push({
      id: 'customer-retention',
      title: 'Customer Retention Signal',
      headline: `${repeatPurchaseRatePct.toFixed(1)}% repeat purchase rate across ${totalCustomers} accounts`,
      detail: `${returningCustomerCount} returning customers drive steady recurring volume, led by ${topCust.customer} (${formatCurrency(topCust.totalSpend)}, ${topCustShare.toFixed(1)}% share).`,
      impact: repeatPurchaseRatePct >= 40 ? 'Positive' : 'Opportunity',
      metricLabel: 'Repeat Rate',
      metricValue: `${repeatPurchaseRatePct.toFixed(1)}%`,
    });
  }

  // Actionable Recommendations
  if (lowProducts.length > 0 && bestProducts.length > 0) {
    const weakest = lowProducts[0];
    const strongest = bestProducts[0];
    recommendations.push({
      id: 'rec-bundle',
      priority: 'High',
      area: 'Product Mix',
      title: `Bundle slow-moving ${weakest.product} with ${strongest.product}`,
      rationale: `${weakest.product} generated only ${formatCurrency(weakest.revenue)} (${weakest.marginPct.toFixed(1)}% margin), lagging significantly behind core inventory.`,
      expectedOutcome: 'Clears low-velocity stock while increasing average order value by 8–12%.',
    });
  }

  if (categories.length > 1) {
    const highMarginCat = [...categories].sort((a, b) => b.marginPct - a.marginPct)[0];
    recommendations.push({
      id: 'rec-margin',
      priority: 'High',
      area: 'Margin Expansion',
      title: `Prioritize upsell campaigns in ${highMarginCat.category}`,
      rationale: `${highMarginCat.category} achieves a ${highMarginCat.marginPct.toFixed(1)}% profit margin—well above the portfolio average of ${profitMarginPct.toFixed(1)}%.`,
      expectedOutcome: 'Shifts revenue mix toward higher-margin offerings, lifting overall net profit.',
    });
  }

  if (newCustomerCount > 0) {
    recommendations.push({
      id: 'rec-retention',
      priority: 'Medium',
      area: 'Customer Lifecycle',
      title: `Launch 30-day onboarding follow-up for ${newCustomerCount} one-time buyers`,
      rationale: `Converting even 20% of single-order customers into repeat accounts at ${formatCurrency(averageOrderValue)} AOV adds substantial recurring revenue.`,
      expectedOutcome: 'Improves repeat purchase rate and stabilizes off-peak monthly order velocity.',
    });
  }

  if (monthly.length >= 3) {
    const sortedM = [...monthly].sort((a, b) => a.revenue - b.revenue);
    const slowestM = sortedM[0];
    const fastestM = sortedM[sortedM.length - 1];
    recommendations.push({
      id: 'rec-seasonality',
      priority: 'Strategic',
      area: 'Seasonal Planning',
      title: `Pre-position inventory ahead of ${fastestM.label.split(' ')[0]} peak and incentivize ${slowestM.label.split(' ')[0]}`,
      rationale: `Revenue peaks strongly around ${fastestM.label} (${formatCurrency(fastestM.revenue)}) while dipping to ${formatCurrency(slowestM.revenue)} during ${slowestM.label}.`,
      expectedOutcome: 'Prevents stockouts during peak demand and smooths quarterly cash flow.',
    });
  }

  return {
    summary: {
      totalSalesUnits,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: uniqueOrders,
      totalProfit: Number(totalProfit.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      profitMarginPct: Number(profitMarginPct.toFixed(1)),
      revenueGrowthPct: Number(revenueGrowthPct.toFixed(1)),
      ordersGrowthPct: Number(ordersGrowthPct.toFixed(1)),
      profitGrowthPct: Number(profitGrowthPct.toFixed(1)),
    },
    monthly,
    yearly,
    daily,
    products,
    bestProducts,
    lowProducts,
    categories,
    customers,
    customerTrends,
    totalCustomers,
    returningCustomerCount,
    newCustomerCount,
    repeatPurchaseRatePct,
    dayOfWeekPattern,
    regionBreakdown,
    insights,
    recommendations,
    availableYears,
    availableCategories,
    availableMonths,
  };
}
