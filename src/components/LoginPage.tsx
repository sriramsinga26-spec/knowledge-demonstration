import React, { useState } from 'react';
import { BarChart3, Eye, EyeOff, Lock, ArrowRight, User, ShieldCheck, TrendingUp, Layers, FileSpreadsheet } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sales2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Please enter both your username and password to access the dashboard.');
      return;
    }

    if (trimmedPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setError('');
    onLogin(trimmedUser);
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('sales2026');
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50">
      {/* Left Visual Analytics Backdrop */}
      <div className="relative lg:w-[56%] xl:w-[60%] bg-[#0B192C] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {!imgError && (
          <img
            src="/src/assets/images/login_analytics_backdrop_1794587014846.jpg"
            alt="Enterprise sales data analytics visualization backdrop"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0B192C]/92 via-[#0B192C]/78 to-[#1D4ED8]/45"
          aria-hidden="true"
        />

        {/* Brand Wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            MetricPulse BI
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-10 lg:my-0 max-w-xl">
          <p className="text-xs font-medium tracking-wide text-blue-300 mb-3">
            Enterprise Analytics Prototype · 2024–2026 Sales Ledger
          </p>
          <h1 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-5">
            Sales Data Analysis and Business Insights Dashboard
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg">
            Transform raw transaction records into revenue trends, product velocity benchmarks, customer retention cohorts, and actionable boardroom reports.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/15 pt-8">
            <div>
              <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold mb-1">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Trend Modeling</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monthly, yearly, and daily sales velocity with growth tracking.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold mb-1">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Product & Cohort</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Top SKUs, category margins, and returning buyer analytics.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold mb-1">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>CSV & Excel Ready</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upload custom datasets and export multi-sheet reports.
              </p>
            </div>
          </div>
        </div>

        {/* Quiet Footer Note */}
        <div className="relative z-10 text-xs text-slate-400 flex flex-wrap items-center gap-2">
          <span>Interactive Business Intelligence</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Chart.js & Real-Time Aggregation</span>
        </div>
      </div>

      {/* Right Sign-In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Sign in to Workspace
            </h2>
            <p className="text-sm text-slate-600">
              Enter your analyst credentials to open the interactive sales dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin)"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Use demo credentials
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Keep session active</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">Demo: admin / sales2026</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-start gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Pre-loaded with 2024–2026 enterprise sample sales data. You can also upload custom CSV or Excel datasets immediately after signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
