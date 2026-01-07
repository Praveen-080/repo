import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProducts, getBatches, addBatch, consumeFromBatch } from "@/services/mockApi";

export default function AdminInventory() {
  const [refresh, setRefresh] = useState(0);
  const products = getProducts({ category: "all" });
  const inventory = useMemo(() => { void refresh; return getBatches(); }, [refresh]);
  const [form, setForm] = useState({ productId: "", lot_no: "", qty_kg: "", received_at: "", expiry_at: "" });

  const submit = (e) => {
    e.preventDefault();
    addBatch({
      product_id: form.productId,
      lot_no: form.lot_no,
      qty_kg: Number(form.qty_kg) || 0,
      received_at: form.received_at,
      expiry_at: form.expiry_at,
    });
    setForm({ productId: "", lot_no: "", qty_kg: "", received_at: "", expiry_at: "" });
    setRefresh((n) => n + 1);
  };

  const consume = (batchId, qty) => {
    consumeFromBatch(batchId, Number(qty) || 0);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Add Arrival Batch</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name_english} ({p.name_tamil})</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lot / Batch No</Label>
              <Input value={form.lot_no} onChange={(e) => setForm((f) => ({ ...f, lot_no: e.target.value }))} required />
            </div>
            <div>
              <Label>Qty (kg)</Label>
              <Input type="number" value={form.qty_kg} onChange={(e) => setForm((f) => ({ ...f, qty_kg: e.target.value }))} required />
            </div>
            <div>
              <Label>Arrival Date</Label>
              <Input type="date" value={form.received_at} onChange={(e) => setForm((f) => ({ ...f, received_at: e.target.value }))} required />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_at} onChange={(e) => setForm((f) => ({ ...f, expiry_at: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Button type="submit">Add Batch</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Inventory Batches</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.map((b) => {
              const p = products.find((x) => x.id === b.product_id);
              const expired = b.expiry_at && new Date(b.expiry_at) < new Date();
              return (
                <div key={b.id} className={`border rounded p-3 ${expired ? 'bg-destructive/10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p?.name_english || b.product_id} <span className="text-muted-foreground">({p?.name_tamil || ''})</span></div>
                      <div className="text-sm text-muted-foreground">Batch {b.lot_no} • {b.remaining_kg}kg / {b.qty_kg}kg • Arrived {b.received_at}{b.expiry_at ? ` • Exp ${b.expiry_at}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Consume kg" className="w-32" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); consume(b.id, e.currentTarget.value); e.currentTarget.value=''; } }} />
                      <Button size="sm" onClick={() => consume(b.id, prompt('Consume quantity (kg)?') || 0)}>Consume</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
