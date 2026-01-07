import React, { useMemo, useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getCategories, getProducts, saveProduct, deleteProduct, getAllOrders, updateOrderStatus, getStoreDetails, saveStoreDetails } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import notify from "@/lib/notify";
export default function Admin() {
  const { adminUser, setShowAdminLogin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("products");

  // Prompt login if not admin, without updating state during render
  React.useEffect(() => {
    if (!adminUser || adminUser.role !== "admin") {
      setShowAdminLogin(true);
    }
  }, [adminUser, setShowAdminLogin]);

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-12 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              Please sign in as an admin to view this page.
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="users" disabled>Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            <ProductsAdmin />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersAdmin />
          </TabsContent>
          <TabsContent value="store" className="mt-6">
            <StoreAdmin />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <ReportsAdmin />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function ProductsAdmin() {
  const [form, setForm] = useState({
    id: "",
    name_english: "",
    name_tamil: "",
    category: "sea_fish",
    price_per_kg: 0,
    stock_kg: 0,
    is_available: true,
    image_url: "",
    description: "",
  });
  const [refresh, setRefresh] = useState(0);
  const categories = getCategories();
  const products = useMemo(() => {
    // reference refresh to intentionally recompute when it changes
    void refresh;
    return getProducts({ category: "all" });
  }, [refresh]);

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, price_per_kg: Number(form.price_per_kg), stock_kg: Number(form.stock_kg), is_available: Boolean(form.is_available) };
  const id = saveProduct(payload);
    setForm({ id: "", name_english: "", name_tamil: "", category: "sea_fish", price_per_kg: 0, stock_kg: 0, is_available: true, image_url: "", description: "" });
  setRefresh((n) => n + 1);
  notify.success(`Saved product ${id}`);
  };

  const edit = (p) => setForm({ ...p });
  const remove = (id) => {
    deleteProduct(id);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{form.id ? "Edit Product" : "Add Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>English Name</Label>
              <Input value={form.name_english} onChange={(e) => setForm((f) => ({ ...f, name_english: e.target.value }))} required />
            </div>
            <div>
              <Label>Tamil Name</Label>
              <Input value={form.name_tamil} onChange={(e) => setForm((f) => ({ ...f, name_tamil: e.target.value }))} required />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price / kg (₹)</Label>
                <Input type="number" value={form.price_per_kg} onChange={(e) => setForm((f) => ({ ...f, price_per_kg: e.target.value }))} required />
              </div>
              <div>
                <Label>Stock (kg)</Label>
                <Input type="number" value={form.stock_kg} onChange={(e) => setForm((f) => ({ ...f, stock_kg: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{form.id ? "Update" : "Add"}</Button>
              {form.id && (
                <Button type="button" variant="ghost" onClick={() => setForm({ id: "", name_english: "", name_tamil: "", category: "sea_fish", price_per_kg: 0, stock_kg: 0, is_available: true, image_url: "", description: "" })}>Clear</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-semibold">{p.name_english} <span className="text-muted-foreground">({p.name_tamil})</span></div>
                  <div className="text-sm text-muted-foreground">{p.category} • ₹{p.price_per_kg}/kg • {p.stock_kg}kg</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(p)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersAdmin() {
  const [statusUpdate, setStatusUpdate] = useState({});
  const [refresh, setRefresh] = useState(0);
  const orders = useMemo(() => {
    void refresh;
    return getAllOrders();
  }, [refresh]);
  const statuses = [
    { id: "received", label: "Received" },
    { id: "cleaning", label: "Cleaning" },
    { id: "out_for_delivery", label: "Out for Delivery" },
    { id: "ready_for_pickup", label: "Ready for Pickup" },
    { id: "completed", label: "Completed" },
  ];

  const apply = (id) => {
    const status = statusUpdate[id];
    if (!status) return;
    updateOrderStatus(id, status);
    setRefresh((n) => n + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Order #{o.order_number}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  <div className="text-sm">Total: ₹{o.total_amount} • {o.delivery_type === 'cash_on_delivery' ? 'COD' : 'Pickup'}</div>
                </div>
                <Badge>{o.status}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Select value={statusUpdate[o.id] || o.status} onValueChange={(v) => setStatusUpdate((s) => ({ ...s, [o.id]: v }))}>
                  <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => apply(o.id)}>Update</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StoreAdmin() {
  const current = getStoreDetails();
  const defaultWeek = {
    Monday: "6:00 AM - 8:00 PM",
    Tuesday: "6:00 AM - 8:00 PM",
    Wednesday: "6:00 AM - 8:00 PM",
    Thursday: "6:00 AM - 8:00 PM",
    Friday: "6:00 AM - 8:00 PM",
    Saturday: "6:00 AM - 8:00 PM",
    Sunday: "6:00 AM - 2:00 PM",
  };
  const [form, setForm] = useState({
    name: current?.name || "",
    address: current?.address || "",
    phone: current?.phone || "",
    email: current?.email || "",
    hours: current?.hours || "",
    hours_by_day: { ...defaultWeek, ...(current?.hours_by_day || {}) },
  });

  const save = (e) => {
    e.preventDefault();
    const hoursSummary = [
      `Monday: ${form.hours_by_day.Monday}`,
      `Tuesday: ${form.hours_by_day.Tuesday}`,
      `Wednesday: ${form.hours_by_day.Wednesday}`,
      `Thursday: ${form.hours_by_day.Thursday}`,
      `Friday: ${form.hours_by_day.Friday}`,
      `Saturday: ${form.hours_by_day.Saturday}`,
      `Sunday: ${form.hours_by_day.Sunday}`,
    ].join("\n");
    saveStoreDetails({ ...form, hours: hoursSummary });
    notify.success("Store details saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="subinbala20092005@gmail.com" />
          </div>
          <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Business Hours (unique per day)</Label>
            </div>
            {Object.entries(form.hours_by_day).map(([day, time]) => (
              <div key={day} className="grid grid-cols-2 items-center gap-2 md:col-span-2">
                <Label className="text-sm w-32">{day}</Label>
                <Input
                  value={time}
                  onChange={(e) => setForm((f) => ({ ...f, hours_by_day: { ...f.hours_by_day, [day]: e.target.value } }))}
                  placeholder="e.g., 6:00 AM - 8:00 PM or Closed"
                />
              </div>
            ))}
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function ReportsAdmin() {
  const orders = getAllOrders();
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const completed = orders.filter((o) => o.status === "completed").length;
  const byStatus = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">₹{totalSales.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{orders.length}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{completed}</CardContent>
      </Card>
      <Card className="md:col-span-3">
        <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byStatus).map(([k, v]) => (
              <Badge key={k} variant="secondary">{k}: {v}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}