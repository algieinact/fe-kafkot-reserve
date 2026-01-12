import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import PublicLayout from "./layout/PublicLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";

// Public Pages
import MenuPage from "./pages/Public/MenuPage";
import ReservationPage from "./pages/Public/ReservationPageMultiStep";
import PaymentPage from "./pages/Public/PaymentPage";
import OrderStatusPage from "./pages/Public/OrderStatusPage";
import HistoryPage from "./pages/Public/HistoryPage";

// Dashboard Pages
import LoginPage from "./pages/Admin/LoginPage";
import ManageMenu from "./pages/Admin/ManageMenu";
import ManageTable from "./pages/Admin/ManageTable";
import ManageReservation from "./pages/Admin/ManageReservation";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route index path="/" element={<MenuPage />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/payment/:orderId" element={<PaymentPage />} />
              <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard (Protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Navigate to="/dashboard/reservations" replace />} />

              {/* Admin-only routes */}
              <Route
                path="/dashboard/menus"
                element={
                  <RoleBasedRoute allowedRoles={["admin", "super_admin"]}>
                    <ManageMenu />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dashboard/tables"
                element={
                  <RoleBasedRoute allowedRoles={["admin", "super_admin"]}>
                    <ManageTable />
                  </RoleBasedRoute>
                }
              />

              {/* Accessible by all authenticated users (admin, super_admin, staff) */}
              <Route path="/dashboard/reservations" element={<ManageReservation />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
