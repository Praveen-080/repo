import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listTickets, createTicket, updateTicketStatus } from "@/services/mockApi";

export default function AdminSupport() {
  const [refresh, setRefresh] = useState(0);
  const tickets = useMemo(() => { void refresh; return listTickets(); }, [refresh]);
  const [form, setForm] = useState({ email: "", subject: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
  createTicket({ email: form.email, subject: form.subject, message: form.message });
  setForm({ email: "", subject: "", message: "" });
    setRefresh((n) => n + 1);
  };

  const setStatus = (id, status) => { updateTicketStatus(id, status); setRefresh((n) => n + 1); };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>New Support Ticket</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((f)=>({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((f)=>({ ...f, subject: e.target.value }))} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.message} onChange={(e) => setForm((f)=>({ ...f, message: e.target.value }))} />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.subject} <span className="text-xs text-muted-foreground">({t.email})</span></div>
                    <div className="text-sm text-muted-foreground">{t.message}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={t.status} onValueChange={(v) => setStatus(t.id, v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
