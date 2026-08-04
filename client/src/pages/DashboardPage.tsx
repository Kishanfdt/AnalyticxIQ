import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
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
} from 'recharts';

export const DashboardPage: React.FC = () => {
  // 1. Date filter states (defaults to empty strings: All Time)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Helper parameters
  const params = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  // 2. Fetch queries from Analytics REST endpoints
  const {
    data: overview,
    isLoading: isLoadingOverview,
    isError: isErrorOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/overview', { params });
      return response.data.data;
    },
  });

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['analytics-products', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/products', { params });
      return response.data.data;
    },
  });

  const {
    data: customers,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ['analytics-customers', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/customers', { params });
      return response.data.data;
    },
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['analytics-categories', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/categories', { params });
      return response.data.data;
    },
  });

  const {
    data: trends,
    isLoading: isLoadingTrends,
    isError: isErrorTrends,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['analytics-trends', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/trends', { params });
      return response.data.data;
    },
  });

  // Fetch recent sales from /sales (retrieve top 5 items for ledger display)
  const {
    data: recentSalesData,
    isLoading: isLoadingRecentSales,
    isError: isErrorRecentSales,
    refetch: refetchRecentSales,
  } = useQuery({
    queryKey: ['analytics-recent-sales'],
    queryFn: async () => {
      const response = await api.get('/sales', {
        params: { page: 1, limit: 5 },
      });
      return response.data.data.sales;
    },
  });

  const isAnyLoading =
    isLoadingOverview ||
    isLoadingProducts ||
    isLoadingCustomers ||
    isLoadingCategories ||
    isLoadingTrends ||
    isLoadingRecentSales;

  const isAnyError =
    isErrorOverview ||
    isErrorProducts ||
    isErrorCustomers ||
    isErrorCategories ||
    isErrorTrends ||
    isErrorRecentSales;

  const handleRetryAll = () => {
    refetchOverview();
    refetchProducts();
    refetchCustomers();
    refetchCategories();
    refetchTrends();
    refetchRecentSales();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
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

  // Category Pie Chart colors
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

  // Render Section
  if (isAnyError) {
    return (
      <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl mt-12 animate-in fade-in duration-300">
        <div className="mx-auto h-14 w-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Analytics Metrics Error</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            There was a connection issue aggregating your store KPIs. Let's try to reload the
            transaction logs.
          </p>
        </div>
        <button
          onClick={handleRetryAll}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Calculations</span>
        </button>
      </div>
    );
  }

  // Empty state: No transactions recorded at all (checks if totalOrders is 0)
  const isLedgerEmpty = !isAnyLoading && overview && Number(overview.totalOrders) === 0;

  if (isLedgerEmpty) {
    return (
      <div className="bg-[#0c0c0f] border border-zinc-800 p-16 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl mt-12 animate-in fade-in duration-300">
        <div className="mx-auto h-16 w-16 bg-zinc-800/40 border border-zinc-800/85 text-zinc-550 rounded-2xl flex items-center justify-center">
          <TrendingUp className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-sans tracking-tight">
            Your Dashboard is Empty
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Welcome to AnalyticxIQ! Once you record customer invoice orders, this dashboard will
            generate real-time revenue splits and monthly performance trends automatically.
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
      {/* 1. Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Activity Period</h2>
          <p className="text-xs text-zinc-500">Filter KPIs by custom business date ranges</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#16161c] border border-zinc-800 px-3.5 py-2.5 rounded-xl text-sm">
            <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white border-none focus:outline-none text-xs focus:ring-0 w-28"
              placeholder="Start Date"
            />
            <span className="text-zinc-650 px-1">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white border-none focus:outline-none text-xs focus:ring-0 w-28"
              placeholder="End Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="ml-1 text-zinc-500 hover:text-white transition-colors"
                title="Clear Filters"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between group hover:border-zinc-700/60 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Total Revenue
            </span>
            {isAnyLoading ? (
              <div className="h-7 bg-zinc-800 rounded animate-pulse w-32 mt-1"></div>
            ) : (
              <div className="text-2xl font-black text-white">
                {formatCurrency(overview?.totalRevenue)}
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between group hover:border-zinc-700/60 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Total Orders
            </span>
            {isAnyLoading ? (
              <div className="h-7 bg-zinc-800 rounded animate-pulse w-20 mt-1"></div>
            ) : (
              <div className="text-2xl font-black text-white">{overview?.totalOrders || 0}</div>
            )}
          </div>
          <div className="h-12 w-12 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between group hover:border-zinc-700/60 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Average Order Value
            </span>
            {isAnyLoading ? (
              <div className="h-7 bg-zinc-800 rounded animate-pulse w-24 mt-1"></div>
            ) : (
              <div className="text-2xl font-black text-white">
                {formatCurrency(overview?.averageOrderValue)}
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Charts Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart (AreaChart) - 2/3 width */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Revenue Performance Trends
              </h3>
              <p className="text-xs text-zinc-500">Monthly breakdown of billed sales</p>
            </div>
            <TrendingUp className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="h-[300px] w-full">
            {isAnyLoading ? (
              <div className="h-full bg-zinc-900/40 animate-pulse rounded-xl border border-zinc-800/40 flex items-center justify-center text-xs text-zinc-650">
                Resolving trend charts...
              </div>
            ) : !trends || trends.length === 0 ? (
              <div className="h-full border border-zinc-800/40 bg-zinc-950/10 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 text-xs font-medium">
                  No sales logged in selected period
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0c0f',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories Pie Chart - 1/3 width */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Category Share
              </h3>
              <p className="text-xs text-zinc-500">Distribution of revenue by item category</p>
            </div>
            <Layers className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="h-[300px] w-full flex flex-col justify-center">
            {isAnyLoading ? (
              <div className="h-full bg-zinc-900/40 animate-pulse rounded-xl border border-zinc-800/40 flex items-center justify-center text-xs text-zinc-650">
                Loading categories...
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="h-full border border-zinc-800/40 bg-zinc-950/10 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-zinc-600 text-xs font-medium">No category shares to map</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0c0f',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                    }}
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

      {/* 4. Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Best Selling Products
              </h3>
              <p className="text-xs text-zinc-500">Products with highest quantities sold</p>
            </div>
            <Package className="h-4.5 w-4.5 text-zinc-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/60 text-zinc-500 font-semibold">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5 text-center">SKU</th>
                  <th className="py-2.5 text-center">Units Sold</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {isAnyLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3">
                        <div className="h-3 bg-zinc-800 rounded w-24"></div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-3 bg-zinc-800 rounded w-12 mx-auto"></div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-3 bg-zinc-800 rounded w-8 mx-auto"></div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="h-3 bg-zinc-800 rounded w-14 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : !products || products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-600">
                      No products recorded in this period
                    </td>
                  </tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3 text-center text-zinc-500 uppercase tracking-wider font-mono">
                        {p.sku}
                      </td>
                      <td className="py-3 text-center font-bold text-zinc-300">{p.quantitySold}</td>
                      <td className="py-3 text-right font-bold text-white">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Valued Customers */}
        <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Top Customers
              </h3>
              <p className="text-xs text-zinc-500">Highest spending accounts by invoice amounts</p>
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
                {isAnyLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3">
                        <div className="h-3 bg-zinc-800 rounded w-20"></div>
                      </td>
                      <td className="py-3">
                        <div className="h-3 bg-zinc-800 rounded w-16"></div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-3 bg-zinc-800 rounded w-6 mx-auto"></div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="h-3 bg-zinc-800 rounded w-14 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : !customers || customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-600">
                      No customer transactions in this period
                    </td>
                  </tr>
                ) : (
                  customers.map((c: any) => (
                    <tr key={c.customerId} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3 font-semibold text-white">{c.name}</td>
                      <td className="py-3 text-zinc-500">{c.company || 'Private Buyer'}</td>
                      <td className="py-3 text-center font-bold text-zinc-300">{c.ordersCount}</td>
                      <td className="py-3 text-right font-bold text-white">
                        {formatCurrency(c.totalSpent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Recent Sales Widget (Full width) */}
      <div className="bg-[#0c0c0f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Recent Sales Journal
            </h3>
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
              {isLoadingRecentSales ? (
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5">
                      <div className="h-3 bg-zinc-800 rounded w-16"></div>
                    </td>
                    <td className="py-3.5">
                      <div className="h-3 bg-zinc-800 rounded w-24"></div>
                    </td>
                    <td className="py-3.5">
                      <div className="h-3 bg-zinc-800 rounded w-36"></div>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="h-3 bg-zinc-800 rounded w-16 ml-auto"></div>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="h-3 bg-zinc-800 rounded w-8 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : !recentSalesData || recentSalesData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-650">
                    No transactions recorded. Get started by recording a sale.
                  </td>
                </tr>
              ) : (
                recentSalesData.map((sale: any) => {
                  const itemsCount =
                    sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const firstItemName = sale.items?.[0]?.product?.name || '';
                  const itemSummaryText =
                    sale.items?.length > 1
                      ? `${firstItemName} and ${sale.items.length - 1} other item(s)`
                      : firstItemName || 'No items';

                  return (
                    <tr key={sale.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3.5 text-zinc-500 font-medium">
                        {formatDate(sale.saleDate)}
                      </td>
                      <td className="py-3.5 font-semibold text-white">{sale.customer?.name}</td>
                      <td className="py-3.5 text-zinc-400">
                        {itemSummaryText}{' '}
                        <span className="text-[10px] text-zinc-550 ml-1">
                          ({itemsCount} unit(s))
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">
                        {formatCurrency(sale.totalAmount)}
                      </td>
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
