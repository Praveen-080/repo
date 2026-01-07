import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Users, Award, Clock } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Fish, label: "Fresh Products", value: "100+" },
    { icon: Users, label: "Happy Customers", value: "5000+" },
    { icon: Award, label: "Years of Excellence", value: "15+" },
    { icon: Clock, label: "Daily Fresh Catch", value: "6AM" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">About Sakthi Fish Market</h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
              Your trusted source for fresh seafood in Erode for over 15 years
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="container py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Sakthi Fish Market has been serving the Erode community since 2010, bringing the freshest catch 
                  from the coast to your table. What started as a small family business has grown into three 
                  thriving locations across the city.
                </p>
                <p>
                  We pride ourselves on quality, freshness, and customer service. Every morning, we receive fresh 
                  seafood directly from coastal fishermen, ensuring that you get the best quality fish, prawns, 
                  crabs, and more.
                </p>
                <p>
                  Our commitment to excellence has made us the preferred choice for thousands of families in Erode 
                  who trust us for their daily seafood needs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <stat.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fish className="h-6 w-6 text-primary" />
                    Freshness Guaranteed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We receive fresh catch daily from trusted coastal suppliers. Every product is carefully 
                    inspected to ensure top quality before reaching our customers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Quality First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our commitment to quality means we never compromise. We maintain proper cold storage, 
                    hygienic handling, and expert cleaning services for all our seafood.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Customer Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our customers are our priority. We offer personalized service, expert advice on seafood 
                    selection, and flexible delivery options to meet your needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="container py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Locations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sampath Nagar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>148, Edayankattuvalasu</p>
                <p>Sampath Nagar, Erode - 638011</p>
                <p className="text-primary font-semibold">+91 87783 87107</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chettipalayam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Vaikalmedu Rd, Ashok Nagar</p>
                <p>Chettipalayam, Erode - 638002</p>
                <p className="text-primary font-semibold">+91 87783 87107</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Railway Station</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>426, EVN Rd, near Railway Station</p>
                <p>Periyar Nagar, Erode - 638001</p>
                <p className="text-primary font-semibold">+91 87783 87107</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Experience Fresh Seafood Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Visit any of our three locations or order online for home delivery
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/products" className="bg-background text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors">
                Shop Now
              </a>
              <a href="/stores" className="border-2 border-background text-background px-6 py-3 rounded-lg font-semibold hover:bg-background/10 transition-colors">
                Find Stores
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}