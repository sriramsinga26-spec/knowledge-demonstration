import type { SalesRecord } from '../types/sales';

interface ProductCatalogItem {
  product: string;
  category: string;
  unitPrice: number;
  marginRate: number;
  weight: number;
}

const PRODUCT_CATALOG: ProductCatalogItem[] = [
  { product: 'Apex Pro Workstation X1', category: 'Enterprise Hardware', unitPrice: 1850, marginRate: 0.34, weight: 14 },
  { product: 'NovaBook Ultra 15', category: 'Enterprise Hardware', unitPrice: 1420, marginRate: 0.31, weight: 18 },
  { product: 'Vertex 4K Studio Display', category: 'Enterprise Hardware', unitPrice: 780, marginRate: 0.28, weight: 13 },
  { product: 'CloudVault Suite Annual', category: 'Cloud & Software', unitPrice: 960, marginRate: 0.68, weight: 19 },
  { product: 'InsightFlow BI License', category: 'Cloud & Software', unitPrice: 640, marginRate: 0.72, weight: 16 },
  { product: 'ShieldGuard Endpoint Pack', category: 'Cloud & Software', unitPrice: 420, marginRate: 0.64, weight: 11 },
  { product: 'ErgoLift Standing Desk Pro', category: 'Office Ergonomics', unitPrice: 690, marginRate: 0.36, weight: 12 },
  { product: 'AeroMesh Executive Chair', category: 'Office Ergonomics', unitPrice: 540, marginRate: 0.39, weight: 15 },
  { product: 'ClearTone Conference Bar', category: 'Audio & Conferencing', unitPrice: 460, marginRate: 0.42, weight: 9 },
  { product: 'AcousticPro ANC Headset', category: 'Audio & Conferencing', unitPrice: 245, marginRate: 0.44, weight: 14 },
  { product: 'ThunderDock 12-Port Hub', category: 'Accessories & Cables', unitPrice: 165, marginRate: 0.48, weight: 10 },
  { product: 'Braided USB-C Power Kit', category: 'Accessories & Cables', unitPrice: 58, marginRate: 0.52, weight: 4 },
  { product: 'Legacy VGA Adapter Pack', category: 'Accessories & Cables', unitPrice: 29, marginRate: 0.18, weight: 2 },
  { product: 'Basic Wired Mouse M10', category: 'Accessories & Cables', unitPrice: 24, marginRate: 0.21, weight: 2 },
];

const CUSTOMERS: { name: string; region: string; loyal: boolean }[] = [
  { name: 'Northstar Logistics Ltd', region: 'North America', loyal: true },
  { name: 'Crestview Financial Group', region: 'North America', loyal: true },
  { name: 'Meridian Health Systems', region: 'North America', loyal: true },
  { name: 'EuroTech Manufacturing', region: 'Europe', loyal: true },
  { name: 'Vanguard Retail Partners', region: 'Europe', loyal: true },
  { name: 'Pacific Rim Engineering', region: 'Asia Pacific', loyal: true },
  { name: 'Helios Energy Corp', region: 'North America', loyal: true },
  { name: 'Kestrel Telecom Group', region: 'Europe', loyal: true },
  { name: 'Solstice BioLabs', region: 'Asia Pacific', loyal: true },
  { name: 'BlueRidge Education Trust', region: 'North America', loyal: true },
  { name: 'Atlas Freight Solutions', region: 'Latin America', loyal: true },
  { name: 'Silverline Architecture', region: 'Europe', loyal: true },
  { name: 'Aurelia Hospitality', region: 'Asia Pacific', loyal: false },
  { name: 'CedarPoint Consulting', region: 'North America', loyal: false },
  { name: 'Harborview Media', region: 'North America', loyal: false },
  { name: 'Nordic Timber Co.', region: 'Europe', loyal: false },
  { name: 'Summit Civic Credit', region: 'North America', loyal: false },
  { name: 'Andes Mining Tech', region: 'Latin America', loyal: false },
  { name: 'Kyoto Precision Works', region: 'Asia Pacific', loyal: false },
  { name: 'BrightPath Clinics', region: 'North America', loyal: false },
  { name: 'Thames Digital Press', region: 'Europe', loyal: false },
  { name: 'Riverstone Apparel', region: 'North America', loyal: false },
  { name: 'Zenith Solar Grid', region: 'Asia Pacific', loyal: false },
  { name: 'Veridian Agro Systems', region: 'Latin America', loyal: false },
  { name: 'Oakwood Legal LLP', region: 'North America', loyal: false },
  { name: 'Boreal Aviation', region: 'Europe', loyal: false },
  { name: 'CoralBay Resorts', region: 'Asia Pacific', loyal: false },
  { name: 'MetroLine Transit', region: 'North America', loyal: false },
];

const PAYMENT_METHODS = ['Corporate Invoice', 'Credit Card', 'Wire Transfer', 'ACH Direct'];

// Deterministic pseudo-random generator for reproducible presentation data
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSampleSalesData(): SalesRecord[] {
  const rand = createRng(20261113);
  const records: SalesRecord[] = [];
  let orderCounter = 1001;

  // Weighted product pool
  const weightedProducts: ProductCatalogItem[] = [];
  for (const item of PRODUCT_CATALOG) {
    for (let i = 0; i < item.weight; i++) {
      weightedProducts.push(item);
    }
  }

  // Months from Jan 2024 to Nov 2026
  const periods: { year: number; month: number; ordersCount: number; scale: number }[] = [
    // 2024
    { year: 2024, month: 1, ordersCount: 5, scale: 0.85 },
    { year: 2024, month: 2, ordersCount: 5, scale: 0.88 },
    { year: 2024, month: 3, ordersCount: 6, scale: 0.95 },
    { year: 2024, month: 4, ordersCount: 6, scale: 0.92 },
    { year: 2024, month: 5, ordersCount: 7, scale: 0.96 },
    { year: 2024, month: 6, ordersCount: 7, scale: 1.05 },
    { year: 2024, month: 7, ordersCount: 6, scale: 0.94 },
    { year: 2024, month: 8, ordersCount: 7, scale: 1.0 },
    { year: 2024, month: 9, ordersCount: 8, scale: 1.08 },
    { year: 2024, month: 10, ordersCount: 8, scale: 1.12 },
    { year: 2024, month: 11, ordersCount: 9, scale: 1.24 },
    { year: 2024, month: 12, ordersCount: 10, scale: 1.32 },
    // 2025 (growth year)
    { year: 2025, month: 1, ordersCount: 6, scale: 1.0 },
    { year: 2025, month: 2, ordersCount: 7, scale: 1.04 },
    { year: 2025, month: 3, ordersCount: 8, scale: 1.14 },
    { year: 2025, month: 4, ordersCount: 7, scale: 1.08 },
    { year: 2025, month: 5, ordersCount: 8, scale: 1.16 },
    { year: 2025, month: 6, ordersCount: 9, scale: 1.26 },
    { year: 2025, month: 7, ordersCount: 8, scale: 1.12 },
    { year: 2025, month: 8, ordersCount: 9, scale: 1.22 },
    { year: 2025, month: 9, ordersCount: 10, scale: 1.3 },
    { year: 2025, month: 10, ordersCount: 10, scale: 1.35 },
    { year: 2025, month: 11, ordersCount: 12, scale: 1.48 },
    { year: 2025, month: 12, ordersCount: 13, scale: 1.56 },
    // 2026 (current year through mid-Nov)
    { year: 2026, month: 1, ordersCount: 8, scale: 1.18 },
    { year: 2026, month: 2, ordersCount: 9, scale: 1.22 },
    { year: 2026, month: 3, ordersCount: 10, scale: 1.34 },
    { year: 2026, month: 4, ordersCount: 9, scale: 1.28 },
    { year: 2026, month: 5, ordersCount: 10, scale: 1.36 },
    { year: 2026, month: 6, ordersCount: 11, scale: 1.48 },
    { year: 2026, month: 7, ordersCount: 10, scale: 1.35 },
    { year: 2026, month: 8, ordersCount: 11, scale: 1.44 },
    { year: 2026, month: 9, ordersCount: 12, scale: 1.55 },
    { year: 2026, month: 10, ordersCount: 14, scale: 1.68 },
    { year: 2026, month: 11, ordersCount: 8, scale: 1.52 },
  ];

  const loyalCustomers = CUSTOMERS.filter((c) => c.loyal);
  const newPool = CUSTOMERS.filter((c) => !c.loyal);

  for (const period of periods) {
    const maxDay = period.year === 2026 && period.month === 11 ? 13 : period.month === 2 ? 28 : 30;
    for (let i = 0; i < period.ordersCount; i++) {
      const day = Math.max(1, Math.min(maxDay, Math.floor(rand() * maxDay) + 1));
      const dateStr = `${period.year}-${String(period.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Loyal customers appear repeatedly across months; newer customers appear occasionally
      const useLoyal = rand() < 0.68;
      const customerObj = useLoyal
        ? loyalCustomers[Math.floor(rand() * loyalCustomers.length)]
        : newPool[Math.floor(rand() * newPool.length)];

      const item = weightedProducts[Math.floor(rand() * weightedProducts.length)];
      const baseQty =
        item.unitPrice > 1000
          ? Math.floor(rand() * 4) + 1
          : item.unitPrice > 400
          ? Math.floor(rand() * 6) + 1
          : Math.floor(rand() * 10) + 2;

      const quantity = Math.max(1, Math.round(baseQty * (0.85 + period.scale * 0.25)));
      const discountVariance = 0.94 + rand() * 0.12;
      const effectivePrice = Math.round(item.unitPrice * discountVariance);
      const revenue = Number((quantity * effectivePrice).toFixed(2));
      const marginJitter = item.marginRate + (rand() * 0.06 - 0.03);
      const profit = Number((revenue * Math.max(0.1, marginJitter)).toFixed(2));

      records.push({
        orderId: `ORD-${period.year}-${orderCounter++}`,
        date: dateStr,
        product: item.product,
        category: item.category,
        customer: customerObj.name,
        region: customerObj.region,
        quantity,
        unitPrice: effectivePrice,
        revenue,
        profit,
        paymentMethod: PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)],
      });
    }
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export const SAMPLE_SALES_DATA: SalesRecord[] = generateSampleSalesData();
export const SAMPLE_DATASET_LABEL = 'Enterprise Tech & Office Retail (2024–2026)';
