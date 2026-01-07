import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, Mail, Clock } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-2">Support</h1>
        <p className="text-muted-foreground mb-8">
          Need help? We're here to assist you!
        </p>

        <div className="max-w-2xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">87783 87107</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">sakthifishmarket@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-muted-foreground">
                      Mon-Sat: 6:00 AM - 8:00 PM<br />
                      Sunday: 6:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">How to place an order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse products, add to cart, and proceed to checkout. Choose delivery or pickup option.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Delivery timings?</h3>
                  <p className="text-sm text-muted-foreground">
                    Home delivery available until 7:00 PM. After that, only self-pickup is available.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Order cancellation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders cannot be cancelled once placed. Please verify all details before confirming.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
