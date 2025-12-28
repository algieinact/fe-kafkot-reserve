import { BrowserRouter as Router, Routes, Route } from "react-router";
import Ecommerce from "./pages/Dashboard/Ecommerce";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import PublicLayout from "./layout/PublicLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Public Pages
import LandingPage from "./pages/Public/LandingPage";
import MenuPage from "./pages/Public/MenuPage";
import ReservationPage from "./pages/Public/ReservationPage";
import PaymentPage from "./pages/Public/PaymentPage";
import OrderStatusPage from "./pages/Public/OrderStatusPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route index path="/" element={<LandingPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/payment/:orderId" element={<PaymentPage />} />
              <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
            </Route>

            {/* Admin Auth */}
            <Route path="/admin/login" element={<SignIn />} />

            {/* Admin Dashboard (Protected) - Coming Soon */}
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<Ecommerce />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
