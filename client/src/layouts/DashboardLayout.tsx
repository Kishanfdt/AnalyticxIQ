import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features';
import {
  Package,
  LogOut,
  User as UserIcon,
  Building,
  Menu,
  X,
  Sparkles,
  Users,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, loading, user, business, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show a loading screen while auth is verifying
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-sm font-medium">Verifying session...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex text-zinc-100 font-sans">
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0c0f] border-r border-zinc-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">AnalyticxIQ</span>
            </div>
            <button
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Business Context */}
          {business && (
            <div className="flex items-center gap-3 bg-[#16161c]/60 border border-zinc-800/60 rounded-xl p-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Building className="h-4.5 w-4.5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Business
                </div>
                <div className="text-sm font-semibold text-white truncate">{business.name}</div>
              </div>
            </div>
          )}

          {/* Sidebar Menu Links */}
          <nav className="space-y-1.5">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/products"
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Package className="h-4.5 w-4.5" />
              <span>Products</span>
            </NavLink>

            <NavLink
              to="/customers"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Customers</span>
            </NavLink>

            <NavLink
              to="/sales"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <DollarSign className="h-4.5 w-4.5" />
              <span>Sales</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer profile & logout */}
        <div className="border-t border-zinc-800/60 pt-4 mt-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold border border-zinc-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-zinc-500 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-800/80 bg-[#0c0c0f] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-white">
              {location.pathname.startsWith('/customers')
                ? 'Customer Management'
                : location.pathname.startsWith('/sales')
                  ? 'Sales Ledger'
                  : location.pathname.startsWith('/dashboard')
                    ? 'Analytics Dashboard'
                    : 'Inventory & Products'}
            </h1>
          </div>
          <div className="text-xs font-medium text-zinc-500 bg-[#16161c] px-3 py-1.5 rounded-lg border border-zinc-800/80">
            System Live
          </div>
        </header>

        {/* Inner Content Grid */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
