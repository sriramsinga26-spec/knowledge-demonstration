import React, { useState } from 'react';
import { Menu, Download, RotateCcw } from 'lucide-react';
import type { NavSection } from '../types/sales';

interface HeaderProps {
  activeSection: NavSection;
  username: string;
  yearFilter: string;
  onYearFilterChange: (year: string) => void;
  availableYears: string[];
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  availableCategories: string[];
  isCustomDataset: boolean;
  onResetSampleData: () => void;
  onQuickExport: () => void;
  onOpenMobileMenu: () => void;
}

const SECTION_TITLES: Record<NavSection, string> = {
  home: 'Dashboard Home',
  sales: 'Sales Analytics',
  products: 'Product Analysis',
  customers: 'Customer Analysis',
  insights: 'Business Insights',
  upload: 'Upload Sales Dataset',
  reports: 'Reports & Export',
};

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  username,
  yearFilter,
  onYearFilterChange,
  availableYears,
  categoryFilter,
  onCategoryFilterChange,
  availableCategories,
  isCustomDataset,
  onResetSampleData,
  onQuickExport,
  onOpenMobileMenu,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 no-print">
      {/* Left: Mobile Menu Trigger + Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Sales Intelligence</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="truncate">{SECTION_TITLES[activeSection]}</span>
          </div>
          <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
            {SECTION_TITLES[activeSection]}
          </h1>
        </div>
      </div>

      {/* Right: Global Filters, Export CTA & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <label htmlFor="global-year-filter" className="sr-only">
            Filter by year
          </label>
          <select
            id="global-year-filter"
            value={yearFilter}
            onChange={(e) => onYearFilterChange(e.target.value)}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          <label htmlFor="global-cat-filter" className="sr-only">
            Filter by category
          </label>
          <select
            id="global-cat-filter"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer max-w-[175px]"
          >
            <option value="All">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {isCustomDataset && (
          <button
            type="button"
            onClick={onResetSampleData}
            title="Restore built-in sample dataset"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Data</span>
          </button>
        )}

        <button
          type="button"
          onClick={onQuickExport}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          {!avatarError ? (
            <img
              src="/src/assets/images/avatar_analyst_user_1794587014898.jpg"
              alt={`${username} profile avatar`}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-navy-900 bg-[#0B192C] text-white text-xs font-bold flex items-center justify-center uppercase">
              {username.slice(0, 2)}
            </div>
          )}
          <div className="hidden xl:block leading-tight">
            <p className="text-xs font-semibold text-slate-900 capitalize">{username}</p>
            <p className="text-[11px] text-slate-500">Business Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
};
