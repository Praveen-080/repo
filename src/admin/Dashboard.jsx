import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAllOrders, getSalesSummary, getTopSellers } from "@/services/mockApi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { IndianRupee, ShoppingCart, PackageCheck, Users } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Dashboard() {
  const orders = getAllOrders();

  // KPIs
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const monthlySales = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
    })
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const todaysOrders = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).length;
  const pendingShipments = orders.filter((o) => ["received", "confirmed", "packed", "out_for_delivery"].includes(o.status)).length;
  const activeCustomers = new Set(orders.map((o) => o.user_id)).size;

  // Charts
  const sales90d = getSalesSummary("90d").series.map((s) => ({ date: s.date.slice(5), total: s.total }));

  const weeklyOrders = useMemo(() => {
    const last7 = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const byDow = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    orders
      .filter((o) => new Date(o.created_at).getTime() >= last7)
      .forEach((o) => {
        const d = new Date(o.created_at);
        const k = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
        byDow[k] += 1;
      });
    return Object.entries(byDow).map(([day, count]) => ({ day, count }));
  }, [orders]);

  const topSellers = getTopSellers(5).map((x) => ({ name: x.product?.name_english || x.pid, qty: x.qty }));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Monthly Sales</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{INR.format(monthlySales)}</div>
            <div className="text-xs text-muted-foreground">Total revenue this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaysOrders}</div>
            <div className="text-xs text-muted-foreground">New orders placed</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Pending Shipments</CardTitle>
            <PackageCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingShipments}</div>
            <div className="text-xs text-muted-foreground">Awaiting fulfillment</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Active Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCustomers}</div>
            <div className="text-xs text-muted-foreground">Unique customers this period</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend + Weekly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card className="min-h-80">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] aspect-auto"
              config={{ total: { label: "Sales (₹)", color: "hsl(var(--primary))" } }}
            >
              <LineChart data={sales90d} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => INR.format(v).replace(/^₹/, "")} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [INR.format(value), "Sales"]} />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

  <Card className="min-h-80">
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] aspect-auto"
              config={{ count: { label: "Orders", color: "hsl(var(--primary))" } }}
            >
              <BarChart data={weeklyOrders} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Products */}
  <Card className="min-h-80">
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[260px] aspect-auto"
            config={{ qty: { label: "Quantity", color: "hsl(var(--primary))" } }}
          >
            <BarChart data={topSellers} margin={{ left: 8, right: 8, top: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={50} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="qty" fill="var(--color-qty)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
