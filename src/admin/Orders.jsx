import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAllOrders, updateOrderStatus, getDeliveryPartners, assignDeliveryPartner } from "@/services/mockApi";

export default function AdminOrders() {
  const [statusUpdate, setStatusUpdate] = useState({});
  const [partnerAssign, setPartnerAssign] = useState({});
  const [refresh, setRefresh] = useState(0);
  const orders = useMemo(() => { void refresh; return getAllOrders(); }, [refresh]);
  const partners = getDeliveryPartners();

  const statuses = [
    { id: "received", label: "Received" },
    { id: "confirmed", label: "Confirmed" },
    { id: "packed", label: "Packed" },
    { id: "out_for_delivery", label: "Out for Delivery" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const applyStatus = (id) => {
    const status = statusUpdate[id];
    if (!status) return;
    updateOrderStatus(id, status);
    setRefresh((n) => n + 1);
  };
  const applyPartner = (id) => {
    const partnerId = partnerAssign[id];
    if (!partnerId) return;
    assignDeliveryPartner(id, partnerId);
    setRefresh((n) => n + 1);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Order #{o.order_number}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  <div className="text-sm">Total: ₹{o.total_amount} • {o.delivery_type === 'cash_on_delivery' ? 'COD' : 'Pickup'}</div>
                  {o.delivery_partner_id && <div className="text-xs text-muted-foreground">Partner: {partners.find(p=>p.id===o.delivery_partner_id)?.name || o.delivery_partner_id}</div>}
                </div>
                <Badge>{o.status}</Badge>
              </div>
              <div className="mt-2 grid md:grid-cols-2 gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Select value={statusUpdate[o.id] || o.status} onValueChange={(v) => setStatusUpdate((s) => ({ ...s, [o.id]: v }))}>
                    <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (<SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => applyStatus(o.id)}>Update</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={partnerAssign[o.id] || o.delivery_partner_id || ""} onValueChange={(v) => setPartnerAssign((s) => ({ ...s, [o.id]: v }))}>
                    <SelectTrigger className="w-[220px]"><SelectValue placeholder="Assign partner" /></SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => applyPartner(o.id)}>Assign</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
