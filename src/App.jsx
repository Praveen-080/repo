import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import LoginModal from "@/components/LoginModal";
import AdminLoginModal from "@/components/AdminLoginModal";
import AdminAuthProvider from "@/context/AdminAuthContext";
import { RouteTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Certification from "./pages/Certification";
import StoreLocator from "./pages/StoreLocator";
import About from "./pages/About";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import WhatsAppRedirect from "./pages/WhatsAppRedirect";
import Profile from "./pages/Profile";
import NewUser from "./pages/NewUser";
import Signup from "./pages/Signup";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminProfile from "./admin/AdminProfile";
import AdminProducts from "./admin/FsProducts";
import AdminInventory from "./admin/Inventory";
import AdminOrders from "./admin/Orders";
import AdminReports from "./admin/Reports";
import AdminSupport from "./admin/Support";
import AdminDeliveryPartners from "./admin/DeliveryPartners";
import AdminSettings from "./admin/Settings";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteActivityTracker from "@/components/RouteActivityTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AdminAuthProvider>
        <SettingsProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RouteTransition element={<Index />} />} />
              <Route path="/signup" element={<RouteTransition element={<Signup />} />} />
              <Route path="/new-user" element={<RouteTransition element={<NewUser />} />} />
              <Route path="/products" element={<RouteTransition element={<Products />} />} />
              <Route path="/product/:id" element={<RouteTransition element={<ProductDetail />} />} />
              <Route path="/cart" element={<RouteTransition element={<Cart />} />} />
              <Route path="/checkout" element={<RouteTransition element={<Checkout />} />} />
              <Route path="/orders" element={<RouteTransition element={<Orders />} />} />
              <Route path="/order-tracking/:id" element={<RouteTransition element={<OrderTracking />} />} />
              <Route path="/certification" element={<RouteTransition element={<Certification />} />} />
              <Route path="/wa-order/:id" element={<RouteTransition element={<WhatsAppRedirect />} />} />
              <Route path="/stores" element={<RouteTransition element={<StoreLocator />} />} />
              <Route path="/about" element={<RouteTransition element={<About />} />} />
              <Route path="/support" element={<RouteTransition element={<Support />} />} />
              <Route path="/profile" element={<RouteTransition element={<Profile />} />} />
              <Route path="/admin/*" element={<RouteTransition element={<AdminLayout />} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<RouteTransition element={<NotFound />} />} />
            </Routes>
            <RouteActivityTracker />
            <LoginModal />
            <AdminLoginModal />
          </BrowserRouter>
        </ErrorBoundary>
        </SettingsProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;