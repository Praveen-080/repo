import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import notify from "@/lib/notify";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ShoppingCart, Shield, Clock, ArrowUpRight, Fish } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrdersByUser, getProductById } from "@/services/mockApi";

export default function Profile() {
  const { user, authLoading, logout, setShowLogin } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      try {
        const orders = getOrdersByUser(user.id).slice(0, 5);
        setRecentOrders(orders);
      } catch {
        setRecentOrders([]);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sfm_recent_products");
      const list = raw ? JSON.parse(raw) : [];
      // Enrich with product details
      const enriched = list
        .map((p) => ({ ...p, product: getOrdersByUser ? undefined : undefined })) // placeholder to keep mapping stable
        .map((p) => {
          try {
            const prod = getProductById(p.id);
            return { ...p, product: prod };
          } catch {
            return p;
          }
        })
        .filter((p) => p.product)
        .slice(0, 8);
      setRecentProducts(enriched);
    } catch {
      setRecentProducts([]);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1 flex flex-col items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1 flex flex-col items-center justify-center text-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">You need to sign in to view your profile.</p>
              <Button onClick={() => setShowLogin(true)}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      notify.success("Signed out");
      navigate("/");
    } catch {
      notify.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-10 flex-1">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-sm">{user.uid || user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{user.name || "Customer"}</span>
              </div>
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{user.phone}</span>
                </div>
              )}
              {user.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/orders")}>View Orders <ShoppingCart className="ml-2 h-4 w-4" /></Button>
              <Button variant="destructive" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Sign Out</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="secondary" onClick={() => navigate("/products")}>Browse Products</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/cart")}>Go to Cart</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/stores")}>Find Stores</Button>
            </CardContent>
          </Card>
        </div>

  {/* Secondary grid: Recent Orders and Recently Viewed Fish */}
  <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground">No recent orders yet.</p>
              ) : (
                <ul className="divide-y">
                  {recentOrders.map((o) => (
                    <li key={o.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{o.order_number}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(o.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1 inline-block">{o.status}</Badge>
                        <div className="font-semibold">₹{Number(o.grand_total || o.total_amount || 0).toLocaleString("en-IN")}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate("/orders")}>See all orders <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5" /> Recently Viewed Fish
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProducts.length === 0 ? (
                <p className="text-muted-foreground">No products viewed yet.</p>
              ) : (
                <ul className="divide-y">
                  {recentProducts.map((p) => (
                    <li key={p.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <Link to={`/product/${p.id}`} className="font-medium hover:underline truncate block">
                          {p.product?.name_english}
                        </Link>
                        <span className="text-xs text-muted-foreground">{new Date(p.at).toLocaleString()}</span>
                      </div>
                      <div className="text-right font-semibold whitespace-nowrap">₹{Number(p.product?.price_per_kg || 0).toLocaleString("en-IN")}/kg</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
