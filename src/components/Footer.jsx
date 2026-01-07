import { Fish, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStoreSettings } from "@/services/firestoreSettings";

export const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getStoreSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load store settings:", error);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return <footer className="border-t bg-card mt-20">
      <div className="container py-12 px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Fish className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Sakthi Fish Market</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fresh seafood delivered to your doorstep
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li className="relative group">
                <Link to="/products" className="inline-block text-muted-foreground transition-colors group-hover:text-primary">
                  Products
                </Link>
                <span className="pointer-events-none absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </li>
              <li className="relative group">
                <Link to="/stores" className="inline-block text-muted-foreground transition-colors group-hover:text-primary">
                  Store Locator
                </Link>
                <span className="pointer-events-none absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </li>
              <li className="relative group">
                <Link to="/about" className="inline-block text-muted-foreground transition-colors group-hover:text-primary">
                  About Us
                </Link>
                <span className="pointer-events-none absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="break-all">{settings?.phone || "+91 87783 87107"}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href={`mailto:${settings?.email || 'subinbala20092005@gmail.com'}`} className="hover:text-primary transition-colors break-all">
                  {settings?.email || "subinbala20092005@gmail.com"}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{settings?.address || "Sampath Nagar Erode"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Business Hours</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              {days.map((day, index) => (
                <div key={day} className="flex justify-between gap-2 sm:gap-4">
                  <span className="font-medium text-foreground/90 whitespace-nowrap">{dayLabels[index]}</span>
                  <span className="text-right whitespace-nowrap text-xs sm:text-sm">{settings?.business_hours?.[day] || '6:00 AM - 8:00 PM'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sakthi Fish Market. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};