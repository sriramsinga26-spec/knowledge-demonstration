import { useMemo, useState } from 'react';
import { SAMPLE_DATASET_LABEL, SAMPLE_SALES_DATA } from './data/sampleSalesData';
import type { NavSection, SalesRecord } from './types/sales';
import { computeAnalytics } from './utils/analyticsEngine';
import { exportAnalyticsCsv } from './utils/datasetIO';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './components/DashboardHome';
import { SalesAnalytics } from './components/SalesAnalytics';
import { ProductAnalysis } from './components/ProductAnalysis';
import { CustomerAnalysis } from './components/CustomerAnalysis';
import { BusinessInsights } from './components/BusinessInsights';
import { UploadDataset } from './components/UploadDataset';
import { Reports } from './components/Reports';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active dataset (starts pre-loaded with realistic sample sales data)
  const [activeRecords, setActiveRecords] = useState<SalesRecord[]>(SAMPLE_SALES_DATA);
  const [datasetName, setDatasetName] = useState<string>(SAMPLE_DATASET_LABEL);
  const [isCustomDataset, setIsCustomDataset] = useState(false);

  // Global Filters
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedDailyMonth, setSelectedDailyMonth] = useState<string>('');

  const snapshot = useMemo(
    () => computeAnalytics(activeRecords, yearFilter, categoryFilter, selectedDailyMonth),
    [activeRecords, yearFilter, categoryFilter, selectedDailyMonth]
  );

  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((r) => {
        const matchYear = yearFilter === 'All' || r.date.startsWith(yearFilter);
        const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
        return matchYear && matchCat;
      }),
    [activeRecords, yearFilter, categoryFilter]
  );

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
    setActiveSection('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
  };

  const handleActivateDataset = (records: SalesRecord[], name: string) => {
    setActiveRecords(records);
    setDatasetName(name);
    setIsCustomDataset(true);
    setYearFilter('All');
    setCategoryFilter('All');
    setSelectedDailyMonth('');
  };

  const handleResetSampleData = () => {
    setActiveRecords(SAMPLE_SALES_DATA);
    setDatasetName(SAMPLE_DATASET_LABEL);
    setIsCustomDataset(false);
    setYearFilter('All');
    setCategoryFilter('All');
    setSelectedDailyMonth('');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={handleLogout}
        datasetName={datasetName}
        recordCount={activeRecords.length}
        isCustomDataset={isCustomDataset}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeSection={activeSection}
          username={username}
          yearFilter={yearFilter}
          onYearFilterChange={(y) => {
            setYearFilter(y);
            setSelectedDailyMonth('');
          }}
          availableYears={snapshot.availableYears}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          availableCategories={snapshot.availableCategories}
          isCustomDataset={isCustomDataset}
          onResetSampleData={handleResetSampleData}
          onQuickExport={() => exportAnalyticsCsv(snapshot, datasetName)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Mobile/Tablet Quick Filter Bar */}
        <div className="md:hidden px-4 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 no-print">
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setSelectedDailyMonth('');
            }}
            aria-label="Filter by year"
            className="flex-1 h-9 px-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="All">All Years</option>
            {snapshot.availableYears.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="flex-1 h-9 px-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="All">All Categories</option>
            {snapshot.availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {filteredRecords.length === 0 && activeSection !== 'upload' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-lg mx-auto my-12">
              <h2 className="font-display text-lg font-bold text-slate-900">
                No Matching Sales Records
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 mb-5">
                No transactions match Year &ldquo;{yearFilter}&rdquo; and Category &ldquo;{categoryFilter}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setYearFilter('All');
                  setCategoryFilter('All');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Reset Active Filters
              </button>
            </div>
          ) : (
            <>
              {activeSection === 'home' && (
                <DashboardHome
                  snapshot={snapshot}
                  records={filteredRecords}
                  onNavigate={setActiveSection}
                />
              )}
              {activeSection === 'sales' && (
                <SalesAnalytics
                  snapshot={snapshot}
                  selectedDailyMonth={selectedDailyMonth}
                  onDailyMonthChange={setSelectedDailyMonth}
                />
              )}
              {activeSection === 'products' && <ProductAnalysis snapshot={snapshot} />}
              {activeSection === 'customers' && <CustomerAnalysis snapshot={snapshot} />}
              {activeSection === 'insights' && (
                <BusinessInsights
                  snapshot={snapshot}
                  datasetName={datasetName}
                  onNavigate={setActiveSection}
                />
              )}
              {activeSection === 'upload' && (
                <UploadDataset
                  activeRecords={activeRecords}
                  activeDatasetName={datasetName}
                  isCustomDataset={isCustomDataset}
                  onActivateDataset={handleActivateDataset}
                  onResetSample={handleResetSampleData}
                />
              )}
              {activeSection === 'reports' && (
                <Reports
                  snapshot={snapshot}
                  datasetName={datasetName}
                  yearFilter={yearFilter}
                  categoryFilter={categoryFilter}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
