import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Shield, Package, ClipboardList, Layers, BarChart3, Headphones, Truck, Settings } from "lucide-react";
import AdminLoginForm from "@/components/AdminLoginForm";
import { Link } from "react-router-dom";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
  >
    <span className="h-4 w-4 inline-flex items-center justify-center">{icon}</span>
    {label}
  </NavLink>
);

export default function AdminLayout() {
  const { adminUser, setShowAdminLogin, ready } = useAdminAuth();

  React.useEffect(() => {
    if (!ready) return; // wait until storage/cookie checked
    if (!adminUser || adminUser.role !== "admin") {
      setShowAdminLogin(true);
    } else {
      setShowAdminLogin(false);
    }
  }, [adminUser, ready, setShowAdminLogin]);

  // While checking session, avoid rendering dashboard content
  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <div className="max-w-md mx-auto text-center text-muted-foreground">Checking admin access…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <Shield className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-semibold mb-1">Admin Sign In</h1>
              <p className="text-muted-foreground">Enter your phone and password to access the dashboard.</p>
            </div>
            <AdminLoginForm />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-6 flex-1 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="sticky top-20 space-y-2 p-3 border rounded-md">
            <div className="text-xs uppercase text-muted-foreground mb-1">Admin</div>
            <NavItem to="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavItem to="/admin/products" icon={<Package className="h-4 w-4" />} label="Products" />
            <NavItem to="/admin/inventory" icon={<Boxes className="h-4 w-4" />} label="Inventory" />
            <NavItem to="/admin/orders" icon={<ClipboardList className="h-4 w-4" />} label="Orders" />
            <NavItem to="/admin/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
            <NavItem to="/admin/support" icon={<Headphones className="h-4 w-4" />} label="Support" />
            <NavItem to="/admin/delivery-partners" icon={<Truck className="h-4 w-4" />} label="Delivery" />
            <NavItem to="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
