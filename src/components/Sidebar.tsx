import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Lightbulb,
  UploadCloud,
  FileText,
  LogOut,
  BarChart3,
  X,
} from 'lucide-react';
import type { NavSection } from '../types/sales';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onLogout: () => void;
  datasetName: string;
  recordCount: number;
  isCustomDataset: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
  { id: 'products', label: 'Product Analysis', icon: Package },
  { id: 'customers', label: 'Customer Analysis', icon: Users },
  { id: 'insights', label: 'Business Insights', icon: Lightbulb },
  { id: 'upload', label: 'Upload Dataset', icon: UploadCloud },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onLogout,
  datasetName,
  recordCount,
  isCustomDataset,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleNav = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden no-print"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0B192C] text-slate-100 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:shrink-0 no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap truncate">
                MetricPulse BI
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="p-3 space-y-1" aria-label="Dashboard Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Dataset Summary & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3">
            <p className="text-xs text-slate-400 mb-1">
              {isCustomDataset ? 'Uploaded Dataset' : 'Active Sample Data'}
            </p>
            <p className="text-xs font-medium text-slate-100 truncate" title={datasetName}>
              {datasetName}
            </p>
            <p className="text-xs text-blue-400 font-mono tabular-nums mt-1">
              {recordCount.toLocaleString()} transactions
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
