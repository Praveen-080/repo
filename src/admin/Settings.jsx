import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoreSettings, updateStoreSettings } from "@/services/firestoreSettings";
import notify from "@/lib/notify";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    phone: "",
    email: "",
    business_hours: {},
    store_name_1: "",
    address_1: "",
    store_name_2: "",
    address_2: "",
    store_name_3: "",
    address_3: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getStoreSettings();
      if (settings) {
        setForm({
          phone: settings.phone || "",
          email: settings.email || "",
          business_hours: settings.business_hours || {},
          store_name_1: settings.store_name_1 || "",
          address_1: settings.address_1 || "",
          store_name_2: settings.store_name_2 || "",
          address_2: settings.address_2 || "",
          store_name_3: settings.store_name_3 || "",
          address_3: settings.address_3 || "",
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      notify.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStoreSettings({
        phone: form.phone,
        email: form.email,
        business_hours: form.business_hours,
        store_name_1: form.store_name_1,
        address_1: form.address_1,
        store_name_2: form.store_name_2,
        address_2: form.address_2,
        store_name_3: form.store_name_3,
        address_3: form.address_3,
      });
      notify.success("Store details saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
      notify.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader><CardTitle>Store Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f)=>({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f)=>({ ...f, email: e.target.value }))} placeholder="subinbala20092005@gmail.com" />
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Store Locations</h3>
          </div>
          
          {[1, 2, 3].map((num) => (
            <div key={`store-${num}`} className="md:col-span-2 border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Store {num}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Store Name</Label>
                  <Input 
                    value={form[`store_name_${num}`]} 
                    onChange={(e) => setForm((f)=>({ ...f, [`store_name_${num}`]: e.target.value }))} 
                    placeholder={`Store name ${num}`}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input 
                    value={form[`address_${num}`]} 
                    onChange={(e) => setForm((f)=>({ ...f, [`address_${num}`]: e.target.value }))} 
                    placeholder={`Address ${num}`}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="md:col-span-2 border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-2">Business hours are stored as an array and apply to all stores</p>
            <p className="text-sm text-muted-foreground">Current hours: {form.business_hours.length} days configured</p>
          </div>
          
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
