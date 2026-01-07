import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDeliveryPartners, saveDeliveryPartner, deleteDeliveryPartner } from "@/services/mockApi";

export default function AdminDeliveryPartners() {
  const [refresh, setRefresh] = useState(0);
  const partners = useMemo(() => { void refresh; return getDeliveryPartners(); }, [refresh]);
  const [form, setForm] = useState({ id: "", name: "", phone: "", vehicle_no: "" });

  const submit = (e) => {
    e.preventDefault();
    saveDeliveryPartner(form);
    setForm({ id: "", name: "", phone: "", vehicle_no: "" });
    setRefresh((n) => n + 1);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Add Partner</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f)=>({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f)=>({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Vehicle No</Label>
              <Input value={form.vehicle_no} onChange={(e) => setForm((f)=>({ ...f, vehicle_no: e.target.value }))} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Partners</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partners.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.phone} • {p.vehicle_no}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => { deleteDeliveryPartner(p.id); setRefresh((n)=>n+1); }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
