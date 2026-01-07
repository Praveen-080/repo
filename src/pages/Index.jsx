import { Navbar } from "@/components/Navbar";
import { DeliveryStatusBanner } from "@/components/DeliveryStatusBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Fish, Truck, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResponsiveCardGrid from "@/components/ResponsiveCardGrid";
import heroImage from "@/assets/hero-fish.jpg";
import heroFish1 from "@/assets/hero-Fish1.jpg";
import heroFish2 from "@/assets/herofish2.avif";
import heroFish3 from "@/assets/hero-Fish3.png";
import { motion } from "framer-motion";
void motion;
const Index = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: "sea_fish",
      name: "Sea Fish",
      tamil: "கடல் மீன்",
      icon: "🐟",
  image: "/images/Sea-Fish.png", 
    },
    {
      id: "crabs",
      name: "Crabs",
      tamil: "நண்டு",
      icon: "🦀",
      image: "/images/Crab.jpg",
    },
    {
      id: "prawns",
      name: "Prawns",
      tamil: "இறால்",
      icon: "🦐",
      image: "/images/Prawn.jpg",
    },
    {
      id: "squid",
      name: "Squid",
      tamil: "கணவாய்",
      icon: "🦑",
      image: "/images/Sqid.jpg",
    },
    {
      id: "river_fish",
      name: "River Fish",
      tamil: "ஆற்று மீன்",
      icon: "🐠",
  image: "/images/River-Fish.png",
    },
  ];
  const features = [{
    icon: Fish,
    title: "Fresh Daily",
    description: "Fresh catch delivered every morning"
  }, {
    icon: Truck,
    title: "Home Delivery",
    description: "Fast delivery to your doorstep"
  }, {
    icon: Shield,
    title: "Quality Assured",
    description: "Premium quality seafood guaranteed"
  }, {
    icon: Clock,
    title: "Quick Service",
    description: "Order online and get it fast"
  }];
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <DeliveryStatusBanner />
      
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] md:h-[70vh] lg:h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Fresh seafood assortment"
            className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
            loading="eager"
            draggable="false"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/20" />
        </div>
        
        <motion.div
          className="container relative z-10 text-center md:text-left px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
        >
          <motion.div 
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Fish className="h-4 w-4" />
              Fresh from the Coast
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-foreground leading-tight">
            Fresh Seafood
            <br />
            <span className="text-primary bg-clip-text">Delivered Daily</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            உங்கள் வீட்டுக்கு புதிய மீன் - Premium quality fish, prawns, and seafood
          </p>
          <div className="flex gap-4 justify-center md:justify-start flex-wrap">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow" onClick={() => navigate("/products")}>
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm" onClick={() => navigate("/stores")}>
              Find Stores
            </Button>
          </div>
        </motion.div>
      </section>
      {/* Categories */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Browse Categories
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Explore our fresh selection of premium seafood
          </motion.p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 hover:border-primary/50 group"
                onClick={() => navigate(`/products?category=${category.id}`)}
              >
                <CardContent className="p-4 md:p-6 text-center">
                  {category.image ? (
                    <div className="mx-auto mb-3 aspect-square w-16 sm:w-20 md:w-24 overflow-hidden rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="text-4xl mb-2">{category.icon}</div>
                  )}
                  <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{category.tamil}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Featured Products (Responsive Grid Demo) */}
      <section className="py-16 bg-linear-to-b from-background to-secondary/20">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Picks</h2>
            <p className="text-muted-foreground">Handpicked favorites from our daily catch</p>
          </motion.div>
          <ResponsiveCardGrid
            items={[
              {
                id: "1",
                title: "Premium Sea Fish",
                description: "Fresh, handpicked sea fish delivered to your doorstep.",
                image: heroFish3,
                ctaLabel: "View Details",
                onClick: () => navigate("/products?category=sea_fish"),
              },
              {
                id: "2",
                title: "Tasty Prawns",
                description: "Juicy prawns perfect for curries, fries, and grills.",
                image: heroFish1,
                ctaLabel: "Shop Prawns",
                onClick: () => navigate("/products?category=prawns"),
              },
              {
                id: "3",
                title: "Fresh River Fish",
                description: "Local favorites with authentic taste and freshness.",
                image: heroFish2,
                ctaLabel: "Explore",
                onClick: () => navigate("/products?category=river_fish"),
              },
            ]}
          />
        </div>
      </section>
      
      {/* Certification Banner (directly under Browse Categories) */}
      <section className="py-12 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-lg p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M12 17.5l-6 3.5 1.5-6.5L3 9.5l6.5-.5L12 3l2.5 6 6.5.5-4.5 5 1.5 6.5-6-3.5z" />
                </svg>
                Trusted Quality
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" />
                  </svg>
                </span>
                See Our Certification
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
                We adhere to strict food safety and quality standards to ensure every seafood product you receive is fresh
                and handled with care. View our official compliance and quality documents.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img src="/images/logo.png" alt="Certification Emblem" className="w-28 h-28 object-contain drop-shadow-md" />
              <Button size="lg" className="w-full md:w-auto shadow" onClick={() => navigate("/certification")}>View Certification</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/30 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose Us</h2>
            <p className="text-muted-foreground">Experience the difference with Sakthi Fish Market</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title} 
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;