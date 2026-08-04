import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features';
import { DashboardLayout } from './layouts';
import {
  LoginPage,
  RegisterPage,
  ProductListPage,
  AddProductPage,
  EditProductPage,
  CustomerListPage,
  AddCustomerPage,
  EditCustomerPage,
  SalesListPage,
  CreateSalePage,
  EditSalePage,
  DashboardPage,
} from './pages';

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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
