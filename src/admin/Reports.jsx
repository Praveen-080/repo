import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllOrders, getSalesSummary, getTopSellers, getRepeatCustomers, getBatches, getProducts } from "@/services/mockApi";

export default function AdminReports() {
  const orders = getAllOrders();
  const salesDaily = getSalesSummary("7d").series;
  const monthly = getSalesSummary("90d").series;
  const salesMonthly = monthly.reduce((acc, d) => {
    const m = d.date.slice(0,7);
    const i = acc.findIndex(x=>x.period===m);
    if (i>=0) acc[i].total += d.total; else acc.push({ period: m, total: d.total });
    return acc;
  }, []);
  const topProducts = getTopSellers(5).map(x=>({ productId: x.pid, quantity: x.qty, name: x.product?.name_english || x.pid }));
  const r = getRepeatCustomers();
  const repeatStats = { totalCustomers: r.total_customers, repeatCustomers: r.repeat_customers, repeatRate: r.total_customers ? Math.round((r.repeat_customers/r.total_customers)*100) : 0 };
  const batches = getBatches();
  const products = getProducts({ category: "all" });
  const wastage = batches.filter(b=>b.expiry_at && new Date(b.expiry_at) < new Date()).reduce((acc,b)=>{
    const expiredKg = Math.max(0, (Number(b.qty_kg)||0) - (Number(b.remaining_kg)||0));
    const name = products.find(p=>p.id===b.product_id)?.name_english || b.product_id;
    const i = acc.findIndex(x=>x.productId===b.product_id);
    if(i>=0) acc[i].expiredKg += expiredKg; else acc.push({ productId: b.product_id, name, expiredKg });
    return acc;
  }, []);

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Daily Sales (last 7)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {salesDaily.slice(-7).map((d) => (<Badge key={d.period} variant="secondary">{d.period}: ₹{d.total}</Badge>))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly Sales (YTD)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {salesMonthly.slice(-6).map((d) => (<Badge key={d.period} variant="secondary">{d.period}: ₹{d.total}</Badge>))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-1">
              {topProducts.map((t) => (<li key={t.productId}>{t.name} — {t.quantity} kg</li>))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Repeat Customers</CardTitle></CardHeader>
          <CardContent>
            <div>Total Customers: {repeatStats.totalCustomers}</div>
            <div>Repeat Customers: {repeatStats.repeatCustomers}</div>
            <div>Repeat Rate: {repeatStats.repeatRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventory Wastage (Expired)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {wastage.map((w) => (<Badge key={w.productId} variant="destructive">{w.name}: {w.expiredKg} kg</Badge>))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
