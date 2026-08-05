import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features';
import { DashboardLayout } from './layouts';

// Lazy load pages for code splitting and bundle size reduction
const LoginPage = lazy(() => import('./pages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages').then((m) => ({ default: m.RegisterPage })));
const ProductListPage = lazy(() => import('./pages').then((m) => ({ default: m.ProductListPage })));
const AddProductPage = lazy(() => import('./pages').then((m) => ({ default: m.AddProductPage })));
const EditProductPage = lazy(() => import('./pages').then((m) => ({ default: m.EditProductPage })));
const CustomerListPage = lazy(() =>
  import('./pages').then((m) => ({ default: m.CustomerListPage })),
);
const AddCustomerPage = lazy(() => import('./pages').then((m) => ({ default: m.AddCustomerPage })));
const EditCustomerPage = lazy(() =>
  import('./pages').then((m) => ({ default: m.EditCustomerPage })),
);
const SalesListPage = lazy(() => import('./pages').then((m) => ({ default: m.SalesListPage })));
const CreateSalePage = lazy(() => import('./pages').then((m) => ({ default: m.CreateSalePage })));
const EditSalePage = lazy(() => import('./pages').then((m) => ({ default: m.EditSalePage })));
const DashboardPage = lazy(() => import('./pages').then((m) => ({ default: m.DashboardPage })));

// Create a single TanStack QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent distracting refetches on focus
      retry: 1, // Fail fast on API errors
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-4 border-t-blue-500 border-zinc-800 rounded-full animate-spin"></div>
                <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
                  Loading Workspace Assets...
                </span>
              </div>
            }
          >
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Dashboard Routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<AddProductPage />} />
                <Route path="products/:id/edit" element={<EditProductPage />} />
                <Route path="customers" element={<CustomerListPage />} />
                <Route path="customers/new" element={<AddCustomerPage />} />
                <Route path="customers/:id/edit" element={<EditCustomerPage />} />
                <Route path="sales" element={<SalesListPage />} />
                <Route path="sales/new" element={<CreateSalePage />} />
                <Route path="sales/:id/edit" element={<EditSalePage />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
