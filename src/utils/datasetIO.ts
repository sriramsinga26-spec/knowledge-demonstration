import * as XLSX from 'xlsx';
import type { AnalyticsSnapshot, SalesRecord } from '../types/sales';

function normalizeHeader(h: string): string {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,\s%]/g, '');
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseDateString(val: unknown): string {
  if (typeof val === 'number' && val > 20000 && val < 90000) {
    // Excel serial date
    const utcDays = Math.floor(val - 25569);
    const utcDate = new Date(utcDays * 86400 * 1000);
    if (!Number.isNaN(utcDate.getTime())) {
      return utcDate.toISOString().slice(0, 10);
    }
  }
  const str = String(val ?? '').trim();
  if (!str) return new Date().toISOString().slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalizedMap = new Map<string, string>();
  for (const h of headers) {
    normalizedMap.set(normalizeHeader(h), h);
  }
  for (const cand of candidates) {
    if (normalizedMap.has(cand)) return normalizedMap.get(cand)!;
  }
  for (const [norm, original] of normalizedMap.entries()) {
    if (candidates.some((c) => norm.includes(c))) {
      return original;
    }
  }
  return null;
}

export interface ParsedDatasetResult {
  records: SalesRecord[];
  detectedColumns: string[];
  warnings: string[];
}

export async function parseSalesFile(file: File): Promise<ParsedDatasetResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded file does not contain any readable sheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded file has no data rows.');
  }

  const headers = Object.keys(rawRows[0]);
  const warnings: string[] = [];

  const orderCol = findColumn(headers, ['orderid', 'orderno', 'invoice', 'transactionid', 'id']);
  const dateCol = findColumn(headers, ['date', 'orderdate', 'saledate', 'transactiondate', 'createdat']);
  const productCol = findColumn(headers, ['product', 'productname', 'item', 'sku', 'description']);
  const categoryCol = findColumn(headers, ['category', 'productcategory', 'department', 'group', 'type']);
  const customerCol = findColumn(headers, ['customer', 'customername', 'client', 'account', 'buyer']);
  const regionCol = findColumn(headers, ['region', 'territory', 'country', 'market', 'location']);
  const qtyCol = findColumn(headers, ['quantity', 'qty', 'units', 'unitssold', 'count', 'volume']);
  const priceCol = findColumn(headers, ['unitprice', 'price', 'rate']);
  const revenueCol = findColumn(headers, ['revenue', 'sales', 'total', 'amount', 'totalsales', 'salesamount']);
  const profitCol = findColumn(headers, ['profit', 'netprofit', 'margin', 'grossprofit']);
  const costCol = findColumn(headers, ['cost', 'cogs', 'unitcost', 'totalcost']);
  const paymentCol = findColumn(headers, ['paymentmethod', 'payment', 'method']);

  if (!revenueCol && (!qtyCol || !priceCol)) {
    warnings.push('No explicit Revenue/Sales column detected; values were inferred from available numeric fields.');
  }
  if (!profitCol && !costCol) {
    warnings.push('No Profit or Cost column found; profit is estimated at 28% gross margin for demonstration.');
  }
  if (!dateCol) {
    warnings.push('No Date column detected; defaulted dates to current reporting date.');
  }

  const records: SalesRecord[] = [];
  rawRows.forEach((row, index) => {
    const qty = qtyCol ? Math.max(1, Math.round(parseNumber(row[qtyCol]) || 1)) : 1;
    let unitPrice = priceCol ? parseNumber(row[priceCol]) : 0;
    let revenue = revenueCol ? parseNumber(row[revenueCol]) : 0;

    if (revenue === 0 && unitPrice > 0) {
      revenue = Number((qty * unitPrice).toFixed(2));
    } else if (unitPrice === 0 && revenue > 0) {
      unitPrice = Number((revenue / qty).toFixed(2));
    }

    let profit = profitCol ? parseNumber(row[profitCol]) : 0;
    if (!profitCol) {
      if (costCol) {
        const costVal = parseNumber(row[costCol]);
        profit = Number((revenue - costVal).toFixed(2));
      } else {
        profit = Number((revenue * 0.28).toFixed(2));
      }
    }

    if (revenue === 0 && profit === 0 && !productCol) {
      return;
    }

    records.push({
      orderId: orderCol && row[orderCol] ? String(row[orderCol]).trim() : `UP-${1000 + index + 1}`,
      date: dateCol ? parseDateString(row[dateCol]) : new Date().toISOString().slice(0, 10),
      product: productCol && row[productCol] ? String(row[productCol]).trim() : `Item ${index + 1}`,
      category: categoryCol && row[categoryCol] ? String(row[categoryCol]).trim() : 'General',
      customer: customerCol && row[customerCol] ? String(row[customerCol]).trim() : `Customer ${index + 1}`,
      region: regionCol && row[regionCol] ? String(row[regionCol]).trim() : 'North America',
      quantity: qty,
      unitPrice: Number(unitPrice.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      paymentMethod: paymentCol && row[paymentCol] ? String(row[paymentCol]).trim() : 'Standard',
    });
  });

  if (records.length === 0) {
    throw new Error('Could not parse any valid sales rows from the uploaded file.');
  }

  return {
    records: records.sort((a, b) => b.date.localeCompare(a.date)),
    detectedColumns: headers,
    warnings,
  };
}

export function downloadSampleCsvTemplate() {
  const sampleRows = [
    ['Order ID', 'Date', 'Product', 'Category', 'Customer', 'Region', 'Quantity', 'Unit Price', 'Revenue', 'Profit'],
    ['ORD-9001', '2026-09-04', 'Apex Pro Workstation X1', 'Enterprise Hardware', 'Northstar Logistics Ltd', 'North America', 3, 1850, 5550, 1887],
    ['ORD-9002', '2026-09-12', 'CloudVault Suite Annual', 'Cloud & Software', 'EuroTech Manufacturing', 'Europe', 5, 960, 4800, 3264],
    ['ORD-9003', '2026-09-19', 'AeroMesh Executive Chair', 'Office Ergonomics', 'Pacific Rim Engineering', 'Asia Pacific', 6, 540, 3240, 1263.6],
    ['ORD-9004', '2026-10-03', 'InsightFlow BI License', 'Cloud & Software', 'Crestview Financial Group', 'North America', 4, 640, 2560, 1843.2],
    ['ORD-9005', '2026-10-14', 'AcousticPro ANC Headset', 'Audio & Conferencing', 'Meridian Health Systems', 'North America', 10, 245, 2450, 1078],
    ['ORD-9006', '2026-10-22', 'NovaBook Ultra 15', 'Enterprise Hardware', 'Northstar Logistics Ltd', 'North America', 2, 1420, 2840, 880.4],
    ['ORD-9007', '2026-11-02', 'ErgoLift Standing Desk Pro', 'Office Ergonomics', 'Vanguard Retail Partners', 'Europe', 4, 690, 2760, 993.6],
    ['ORD-9008', '2026-11-08', 'ThunderDock 12-Port Hub', 'Accessories & Cables', 'Atlas Freight Solutions', 'Latin America', 8, 165, 1320, 633.6],
  ];

  const csvContent = sampleRows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_sales_dataset_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAnalyticsCsv(snapshot: AnalyticsSnapshot, datasetName: string) {
  const lines: string[] = [
    'Sales Data Analysis and Business Insights Report',
    `Dataset,"${datasetName}"`,
    `Generated,"${new Date().toISOString().slice(0, 10)}"`,
    '',
    'EXECUTIVE SUMMARY',
    `Total Sales (Units),${snapshot.summary.totalSalesUnits}`,
    `Total Revenue,${snapshot.summary.totalRevenue}`,
    `Total Orders,${snapshot.summary.totalOrders}`,
    `Total Profit,${snapshot.summary.totalProfit}`,
    `Average Order Value,${snapshot.summary.averageOrderValue}`,
    `Profit Margin %,${snapshot.summary.profitMarginPct}%`,
    '',
    'MONTHLY PERFORMANCE',
    'Month,Orders,Units,Revenue,Profit,MoM Growth %',
    ...snapshot.monthly.map(
      (m) =>
        `"${m.label}",${m.orders},${m.units},${m.revenue},${m.profit},${m.growthPct !== null ? `${m.growthPct}%` : 'N/A'}`
    ),
    '',
    'PRODUCT PERFORMANCE',
    'Product,Category,Orders,Units,Revenue,Profit,Margin %',
    ...snapshot.products.map(
      (p) =>
        `"${p.product}","${p.category}",${p.orders},${p.units},${p.revenue},${p.profit},${p.marginPct}%`
    ),
    '',
    'TOP CUSTOMERS',
    'Customer,Region,Segment,Orders,Total Spend,Total Profit',
    ...snapshot.customers
      .slice(0, 20)
      .map(
        (c) =>
          `"${c.customer}","${c.region}",${c.segment},${c.orders},${c.totalSpend},${c.totalProfit}`
      ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales_insights_report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAnalyticsExcel(snapshot: AnalyticsSnapshot, datasetName: string) {
  const wb = XLSX.utils.book_new();

  const summaryRows = [
    { Metric: 'Dataset Source', Value: datasetName },
    { Metric: 'Generated Date', Value: new Date().toISOString().slice(0, 10) },
    { Metric: 'Total Sales (Units)', Value: snapshot.summary.totalSalesUnits },
    { Metric: 'Total Revenue ($)', Value: snapshot.summary.totalRevenue },
    { Metric: 'Total Orders', Value: snapshot.summary.totalOrders },
    { Metric: 'Total Profit ($)', Value: snapshot.summary.totalProfit },
    { Metric: 'Average Order Value ($)', Value: snapshot.summary.averageOrderValue },
    { Metric: 'Profit Margin (%)', Value: snapshot.summary.profitMarginPct },
    { Metric: 'Total Customers', Value: snapshot.totalCustomers },
    { Metric: 'Repeat Purchase Rate (%)', Value: snapshot.repeatPurchaseRatePct },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Executive Summary');

  const monthlyRows = snapshot.monthly.map((m) => ({
    Month: m.label,
    Orders: m.orders,
    Units: m.units,
    Revenue: m.revenue,
    Profit: m.profit,
    'MoM Growth %': m.growthPct ?? 0,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyRows), 'Monthly Performance');

  const productRows = snapshot.products.map((p) => ({
    Product: p.product,
    Category: p.category,
    Orders: p.orders,
    Units: p.units,
    Revenue: p.revenue,
    Profit: p.profit,
    'Margin %': p.marginPct,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows), 'Product Analysis');

  const customerRows = snapshot.customers.map((c) => ({
    Customer: c.customer,
    Region: c.region,
    Segment: c.segment,
    Orders: c.orders,
    'Total Spend': c.totalSpend,
    'Total Profit': c.totalProfit,
    'Last Order': c.lastOrderDate,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerRows), 'Customer Analysis');

  const insightRows = snapshot.insights.map((ins) => ({
    Category: ins.title,
    Finding: ins.headline,
    Detail: ins.detail,
    Metric: `${ins.metricLabel}: ${ins.metricValue}`,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(insightRows), 'Business Insights');

  XLSX.writeFile(wb, `sales_analytics_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
