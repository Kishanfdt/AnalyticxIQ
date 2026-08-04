import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  Users, 
  ArrowUpRight, 
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  ChevronDown,
  Download,
  Percent,
  Map as MapIcon,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  // 1. Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [salespersonId, setSalespersonId] = useState<string>(''); // future ready
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);

  // Compile active parameters for queries
  const activeParams = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    productId: productId || undefined,
    customerId: customerId || undefined,
    categoryId: categoryId || undefined,
    region: region || undefined,
    salespersonId: salespersonId || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  // 2. Fetch selectors data: Products and Customers lists
  const { data: productsData } = useQuery({
    queryKey: ['dashboard-selector-products'],
    queryFn: async () => {
      const response = await api.get('/products', { params: { limit: 100 } });
      return response.data.data.products;
    },
  });

  const { data: customersData } = useQuery({
    queryKey: ['dashboard-selector-customers'],
    queryFn: async () => {
      const response = await api.get('/customers', { params: { limit: 100 } });
      return response.data.data.customers;
    },
  });

  const products = productsData || [];
  const customers = customersData || [];

  // Extract unique categories from product list
  const categoriesMap = new Map<string, string>();
  products.forEach((p: any) => {
    if (p.category) {
      categoriesMap.set(p.category.id, p.category.name);
    }
  });
  const categories = Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));

  // 3. Fetch Advanced Analytics KPIs & Series
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics, 
    isError: isErrorAnalytics, 
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['advanced-analytics', activeParams],
    queryFn: async () => {
      const response = await api.get('/analytics/advanced', { params: activeParams });
      return response.data.data;
    },
  });

  // Fetch recent sales (Recent Activity)
  const { data: recentSales } = useQuery({
    queryKey: ['dashboard-recent-sales'],
    queryFn: async () => {
      const response = await api.get('/sales', { params: { page: 1, limit: 5 } });
      return response.data.data.sales;
    },
  });

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setProductId('');
    setCustomerId('');
    setCategoryId('');
    setRegion('');
    setSalespersonId('');
    setStatus('');
    setSearch('');
  };

  // Authenticated export handler
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await api.get('/export/analytics', {
        params: {
          format,
          ...activeParams,
        },
        responseType: 'blob',
      });

      const contentType = String(response.headers['content-type'] || 'text/csv');
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let extension = 'csv';
      if (format === 'excel') extension = 'xlsx';
      if (format === 'pdf') extension = 'html';

      link.setAttribute('download', `analytics_export_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // Helper formatting methods
  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

  if (isErrorAnalytics) {
    return (
      <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl mt-12 animate-in fade-in duration-300">
        <div className="mx-auto h-14 w-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Business Intelligence Failure</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            We encountered a connection issue compiling your business reports. Let's try to reload the transaction logs.
          </p>
        </div>
        <button
          onClick={() => refetchAnalytics()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Recalculate Ledger</span>
        </button>
      </div>
    );
  }

  // Check if no transactions at all
  const isLedgerEmpty = !isLoadingAnalytics && analytics && Number(analytics.totalOrders) === 0 && !search && !startDate && !endDate;

  if (isLedgerEmpty) {
    return (
      <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl mt-12 animate-in fade-in duration-300">
        <div className="mx-auto h-16 w-16 bg-zinc-800/40 border border-zinc-800/85 text-zinc-550 rounded-2xl flex items-center justify-center">
          <Activity className="h-8 w-8 text-zinc-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-sans tracking-tight">Analytics Ledger Empty</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Record client transactions to activate the advanced Business Intelligence dashboards and growth trend reports automatically.
          </p>
        </div>
        <Link
          to="/sales/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <DollarSign className="h-4.5 w-4.5" />
          <span>Record First Sale</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Dashboard Controls Toolbar */}
      <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-500" />
              <span>Interactive Filters</span>
            </h2>
            <p className="text-xs text-zinc-500">Apply granular parameters to segment reporting metrics</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Toggle */}
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="inline-flex items-center gap-2 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] text-zinc-350 hover:text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
            >
              <span>{filtersExpanded ? 'Hide Filters' : 'Expand Filters'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${filtersExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              {exportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-[#0c0c0f] border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-155">
                    <button
                      onClick={() => { handleExport('csv'); setExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    >
                      Export CSV Summary
                    </button>
                    <button
                      onClick={() => { handleExport('excel'); setExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    >
                      Export Excel (XLSX)
                    </button>
                    <button
                      onClick={() => { handleExport('pdf'); setExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    >
                      Export PDF Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Granular Filters Grid */}
        {(filtersExpanded || search || startDate || endDate || productId || customerId || categoryId || region || status) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-zinc-800/40 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Search Products/Customers
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type item name or brand..."
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Select Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- All Products --</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Customer Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Select Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- All Customers --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Select Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- All Categories --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Region Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Select Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- All Regions --</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- All Statuses --</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Salesperson (Future Ready) */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Sales Rep (Future-ready)
              </label>
              <input
                type="text"
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                placeholder="ID lookup placeholder"
                className="w-full bg-[#16161c] border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-2 md:col-span-1 flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full py-2 border border-zinc-800 bg-[#16161c]/40 hover:bg-[#16161c] hover:text-white text-zinc-400 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Comparison Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Gross vs Net Revenue */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-20 w-20 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Gross / Net Sales</span>
              <span className="h-9 w-9 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              {isLoadingAnalytics ? (
                <div className="space-y-1.5">
                  <div className="h-6 bg-zinc-850 rounded w-28 animate-pulse"></div>
                  <div className="h-4 bg-zinc-850 rounded w-20 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl font-black text-white">{formatCurrency(analytics?.netRevenue)}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Gross: <span className="font-semibold">{formatCurrency(analytics?.grossRevenue)}</span>
                  </div>
                </>
              )}
            </div>
            {/* Leakage Indicator */}
            {!isLoadingAnalytics && analytics?.grossRevenue > 0 && (
              <div className="pt-2.5 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                <span>Discount Leakage</span>
                <span className="text-rose-400 flex items-center gap-0.5">
                  <Percent className="h-3 w-3" />
                  {(((analytics.grossRevenue - analytics.netRevenue) / analytics.grossRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Net Revenue Growth Rate */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-20 w-20 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Growth Indicators</span>
              <span className="h-9 w-9 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              {isLoadingAnalytics ? (
                <div className="space-y-1.5">
                  <div className="h-6 bg-zinc-850 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-zinc-850 rounded w-24 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl font-black text-white">
                    {analytics?.revenueGrowth >= 0 ? '+' : ''}{analytics?.revenueGrowth?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Month-over-Month split</div>
                </>
              )}
            </div>
            {/* Trend Indicator */}
            {!isLoadingAnalytics && (
              <div className="pt-2.5 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                <span>Revenue Trend</span>
                {analytics?.revenueGrowth >= 0 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Upward
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="h-3.5 w-3.5" /> Downward
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Margin & Net Profit */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-20 w-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Profit & Margin</span>
              <span className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                <Percent className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              {isLoadingAnalytics ? (
                <div className="space-y-1.5">
                  <div className="h-6 bg-zinc-850 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-zinc-850 rounded w-20 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl font-black text-white">{analytics?.profitMargin?.toFixed(1)}%</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Profit: <span className="font-semibold text-white">{formatCurrency(analytics?.profit)}</span>
                  </div>
                </>
              )}
            </div>
            {/* Margin split */}
            {!isLoadingAnalytics && (
              <div className="pt-2.5 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="text-zinc-400 font-semibold">
                  {formatCurrency((analytics.netRevenue - analytics.profit))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Orders, AOV, & Purchase Frequency */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-zinc-700/60 transition-all">
          <div className="absolute top-0 right-0 h-20 w-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Orders & AOV</span>
              <span className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              {isLoadingAnalytics ? (
                <div className="space-y-1.5">
                  <div className="h-6 bg-zinc-850 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-zinc-850 rounded w-16 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-xl font-black text-white">{analytics?.totalOrders} Orders</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    AOV: <span className="font-semibold text-white">{formatCurrency(analytics?.averageOrderValue)}</span>
                  </div>
                </>
              )}
            </div>
            {/* Purchase Frequency */}
            {!isLoadingAnalytics && (
              <div className="pt-2.5 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                <span>Purchase Frequency</span>
                <span className="text-amber-400 font-semibold">
                  {analytics?.customerPurchaseFrequency?.toFixed(2)}x
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Charts Grid Row (3 Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart & Growth Rate (Dual-series chart) */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Monthly MoM Growth & Revenue</h3>
              <p className="text-xs text-zinc-500">Chronological analysis of store performance</p>
            </div>
            <TrendingUp className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="h-[300px] w-full">
            {isLoadingAnalytics ? (
              <div className="h-full bg-zinc-900/40 animate-pulse rounded-xl border border-zinc-800/40 flex items-center justify-center text-xs text-zinc-650">
                Resolving trend charts...
              </div>
            ) : !analytics?.monthlyGrowth || analytics.monthlyGrowth.length === 0 ? (
              <div className="h-full border border-zinc-800/40 bg-zinc-950/10 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 text-xs font-medium">No sales logged in selected period</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0c0f', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(value: any, name: any) => [name === 'growthRate' ? `${Number(value).toFixed(1)}%` : formatCurrency(value), name === 'growthRate' ? 'Growth Rate' : 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Revenue By Category */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Revenue by Category</h3>
              <p className="text-xs text-zinc-500">Distribution share of categories</p>
            </div>
            <Layers className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="h-[300px] w-full flex flex-col justify-center">
            {isLoadingAnalytics ? (
              <div className="h-full bg-zinc-900/40 animate-pulse rounded-xl border border-zinc-800/40 flex items-center justify-center text-xs text-zinc-650">
                Loading categories...
              </div>
            ) : !analytics?.salesByCategory || analytics.salesByCategory.length === 0 ? (
              <div className="h-full border border-zinc-800/40 bg-zinc-950/10 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 text-xs font-medium">No category shares to map</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.salesByCategory}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.salesByCategory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0c0f', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Sales By Region (BarChart) */}
      <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Sales By Region</h3>
            <p className="text-xs text-zinc-500">Regional sales revenue and order counts</p>
          </div>
          <MapIcon className="h-4.5 w-4.5 text-zinc-500" />
        </div>

        <div className="h-[250px] w-full">
          {isLoadingAnalytics ? (
            <div className="h-full bg-zinc-900/40 animate-pulse rounded-xl border border-zinc-800/40 flex items-center justify-center text-xs text-zinc-650">
              Loading regions...
            </div>
          ) : !analytics?.salesByRegion || analytics.salesByRegion.length === 0 ? (
            <div className="h-full border border-zinc-800/40 bg-zinc-950/10 rounded-xl flex flex-col items-center justify-center text-center p-4">
              <span className="text-zinc-600 text-xs font-medium">No regional records to map</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.salesByRegion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="region" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c0c0f', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', color: '#10b981' }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 5. Drill-Down detail tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Products Split: Top Performing vs Low Selling Products */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Best vs Low Selling Products</h3>
              <p className="text-xs text-zinc-500">Identify inventory movers and low performers</p>
            </div>
            <Package className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Products */}
            <div>
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Top Products</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {isLoadingAnalytics ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-10 bg-zinc-900 rounded-lg animate-pulse" />)
                ) : !analytics?.topPerformingProducts || analytics.topPerformingProducts.length === 0 ? (
                  <div className="text-zinc-650 text-xs py-4 text-center">No data available</div>
                ) : (
                  analytics.topPerformingProducts.map((p: any) => (
                    <div key={p.productId} className="flex justify-between items-center p-2 border border-zinc-850 hover:border-zinc-800 bg-[#16161c]/20 hover:bg-[#16161c]/40 rounded-xl transition-all">
                      <div className="truncate max-w-[120px]">
                        <span className="text-xs font-semibold text-white block truncate">{p.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">{p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">{formatCurrency(p.revenue)}</span>
                        <span className="text-[10px] text-zinc-500 font-bold block">{p.quantitySold} units</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Products */}
            <div>
              <h4 className="text-[10px] font-bold text-rose-450 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Low Sellers</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {isLoadingAnalytics ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-10 bg-zinc-900 rounded-lg animate-pulse" />)
                ) : !analytics?.lowSellingProducts || analytics.lowSellingProducts.length === 0 ? (
                  <div className="text-zinc-650 text-xs py-4 text-center">No data available</div>
                ) : (
                  analytics.lowSellingProducts.map((p: any) => (
                    <div key={p.productId} className="flex justify-between items-center p-2 border border-zinc-850 hover:border-zinc-800 bg-[#16161c]/20 hover:bg-[#16161c]/40 rounded-xl transition-all">
                      <div className="truncate max-w-[120px]">
                        <span className="text-xs font-semibold text-white block truncate">{p.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">{p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">{formatCurrency(p.revenue)}</span>
                        <span className="text-[10px] text-zinc-550 font-bold block">{p.quantitySold} units</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Valued Customers */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Top Spent Customers</h3>
              <p className="text-xs text-zinc-500">Highest invoice accounts in selected period</p>
            </div>
            <Users className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/60 text-zinc-500 font-semibold">
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Company</th>
                  <th className="py-2.5 text-center">Orders</th>
                  <th className="py-2.5 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {isLoadingAnalytics ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3"><div className="h-3 bg-zinc-800 rounded w-20"></div></td>
                      <td className="py-3"><div className="h-3 bg-zinc-800 rounded w-16"></div></td>
                      <td className="py-3 text-center"><div className="h-3 bg-zinc-800 rounded w-6 mx-auto"></div></td>
                      <td className="py-3 text-right"><div className="h-3 bg-zinc-800 rounded w-14 ml-auto"></div></td>
                    </tr>
                  ))
                ) : !analytics?.topCustomers || analytics.topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-650">
                      No customer transactions in this period
                    </td>
                  </tr>
                ) : (
                  analytics.topCustomers.map((c: any) => (
                    <tr key={c.customerId} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3 font-semibold text-white">{c.name}</td>
                      <td className="py-3 text-zinc-500">{c.company || 'Private Buyer'}</td>
                      <td className="py-3 text-center font-bold text-zinc-350">{c.ordersCount}</td>
                      <td className="py-3 text-right font-bold text-white">{formatCurrency(c.totalSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Recent Activity (Recent Sales Journal) */}
      <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Recent Sales Journal</h3>
            <p className="text-xs text-zinc-500">Most recent order ledger transactions</p>
          </div>
          <Link
            to="/sales"
            className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>View All Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/60 text-zinc-500 font-semibold">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Items Summary</th>
                <th className="py-2.5 text-right">Invoice Total</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {!recentSales || recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-650">
                    No transactions recorded. Get started by recording a sale.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale: any) => {
                  const itemsCount = sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const firstItemName = sale.items?.[0]?.product?.name || '';
                  const itemSummaryText = sale.items?.length > 1 
                    ? `${firstItemName} and ${sale.items.length - 1} other item(s)`
                    : firstItemName || 'No items';

                  return (
                    <tr key={sale.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3.5 text-zinc-550 font-medium">{formatDate(sale.saleDate)}</td>
                      <td className="py-3.5 font-semibold text-white">{sale.customer?.name}</td>
                      <td className="py-3.5 text-zinc-400">
                        {itemSummaryText}{' '}
                        <span className="text-[10px] text-zinc-550 ml-1">({itemsCount} unit(s))</span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">{formatCurrency(sale.totalAmount)}</td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/sales/${sale.id}/edit`}
                          className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800/50 transition-colors inline-block"
                          title="View / Edit Invoice"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
