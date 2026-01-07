import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";

export default function Certification() {
  const certificates = [
    {
      id: "iso9001",
      title: "ISO 9001:2015 — Quality Management System",
      number: "2280055141OQM",
      issueDate: "Certified",
      validTill: "Current",
      scope: "Wholesale and Trading of Fish",
      image: "/images/Certification.jpg", 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Medal className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">ISO Certified</h1>
          </div>
          <p className="text-muted-foreground">We are ISO 9001:2015 certified for Quality Management System, ensuring the highest standards in wholesale and trading of fish.</p>

          {certificates.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full"><Medal className="h-4 w-4 mr-1" />ISO Certified</Badge>
                    {c.title}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-3">Certificate No: {c.number}</span>
                    <span>Status: {c.validTill}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 items-start">
                <div className="border rounded-lg overflow-hidden bg-secondary/20">
                  <img src={c.image} alt={`${c.title} certificate`} className="w-full h-auto object-contain" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold">About ISO 9001:2015</h3>
                  <p className="text-sm text-muted-foreground">
                    ISO 9001:2015 is the international standard for Quality Management Systems (QMS). This certification 
                    demonstrates our commitment to consistently providing products and services that meet customer and 
                    regulatory requirements, with a focus on continuous improvement.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Scope:</strong> {c.scope}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For any verification requests or more information, please contact us via email or visit our support page.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
