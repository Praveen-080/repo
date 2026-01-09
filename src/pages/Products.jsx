import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryStatusBanner } from "@/components/DeliveryStatusBanner";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/firestoreProducts";
import { useAuth } from "@/context/AuthContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const cartKey = user ? `cart_${user.id}` : "cart";

  // Get cart count from localStorage
  const updateCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    setCartCount(cart.length);
  }, [cartKey]);

  useEffect(() => {
    updateCartCount();
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, [updateCartCount]);

  const clearCart = useCallback(() => {
    const ok = window.confirm("Remove all items from cart?");
    if (!ok) return;
    localStorage.setItem(cartKey, "[]");
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartKey]);

  const categories = [{
    id: "all",
    label: "All"
  }, {
    id: "sea_fish",
    label: "Sea Fish (கடல் மீன்)"
  }, {
    id: "river_fish",
    label: "River Fish (ஆற்று மீன்)"
  }, {
    id: "crabs",
    label: "Crabs (நண்டு)"
  }, {
    id: "prawns",
    label: "Prawns (இறால்)"
  }, {
    id: "squid",
    label: "Squid (கணவாய்)"
  }];
  
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams, setSelectedCategory]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Load products from Firestore
      const filter = selectedCategory === "all" 
        ? { isAvailable: true } 
        : { category: selectedCategory, isAvailable: true };
      
      const data = await getProducts(filter);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (selectedCategory && selectedCategory !== "all") p.set("category", selectedCategory);
      else p.delete("category");
      return p;
    });
  }, [selectedCategory, fetchProducts, setSearchParams]);
  
  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name_english?.toLowerCase().includes(query) ||
      product.name_tamil?.toLowerCase().includes(query) ||
      product.name_tanglish?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });
  return <div className="min-h-screen flex flex-col">
      <Navbar cartItemCount={cartCount} />
      <DeliveryStatusBanner />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-6">Our Products</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Category Filter + Clear Cart */}
        <div className="mb-8 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          {cartCount > 0 && (
            <Button variant="destructive" onClick={clearCart} title="Remove all items from cart">
              Remove All
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {[...Array(8)].map((_, i) => <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />)}
          </div> : filteredProducts.length === 0 ? <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery.trim() ? `No products found for "${searchQuery}"` : "No products found in this category"}
            </p>
            {searchQuery.trim() && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="mt-3 text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div> : <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {filteredProducts.map(product => (
              <div key={product.id} className="h-full">
                <ProductCard
                  id={product.id}
                  nameEnglish={product.name_english}
                  nameTamil={product.name_tamil}
                  category={product.category}
                  pricePerKg={product.price_per_kg}
                  imageUrl={product.image_url || undefined}
                  stockKg={product.stock_kg}
                  stockType={product.stock_type}
                  count={product.count}
                />
              </div>
            ))}
          </div>}
      </main>

      <Footer />
    </div>;
};
export default Products;