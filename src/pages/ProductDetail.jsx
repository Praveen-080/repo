import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryStatusBanner } from "@/components/DeliveryStatusBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Zap } from "lucide-react";
import { getProductById } from "@/services/firestoreProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import notify from "@/lib/notify";

const ProductDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setShowLogin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const fetchProduct = useCallback(async () => {
    try {
      const data = await getProductById(id);
      if (!data || !data.is_available) {
        notify.warning("Product unavailable or not found");
        navigate("/products");
        return setLoading(false);
      }
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      notify.error("Failed to load product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);
  const addToCart = () => {
    if (!user) {
      notify.warning("Please sign in first to add items to cart");
      setShowLogin(true);
      return;
    }
    if (!product) return;
    
    const cartKey = `cart_${user.uid || user.id}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItemIndex = existingCart.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      existingCart[existingItemIndex].quantity += quantity;
      existingCart[existingItemIndex].subtotal = existingCart[existingItemIndex].quantity * product.price_per_kg;
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast({
        title: "Cart Updated! 🛒",
        description: `Updated ${product.name_english} quantity to ${existingCart[existingItemIndex].quantity}kg.`,
      });
    } else {
      // Add new item to cart
      const cartItem = {
        productId: product.id,
        nameEnglish: product.name_english,
        nameTamil: product.name_tamil,
        pricePerKg: product.price_per_kg,
        quantity,
        cutType: "no_cut",
        cutOptions: [],
        needsCleaning: false,
        subtotal: product.price_per_kg * quantity
      };
      existingCart.push(cartItem);
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast({
        title: "Added to Cart! 🛒",
        description: `${quantity}kg of ${product.name_english} added to your cart.`,
      });
    }
  };

  const buyNow = () => {
    if (!user) {
      notify.warning("Please sign in first to place an order");
      setShowLogin(true);
      return;
    }
    if (!product) {
      notify.error("Product not found");
      return;
    }
    const cartKey = `cart_${user.uid || user.id}`;
    const cartItem = {
      productId: product.id,
      nameEnglish: product.name_english,
      nameTamil: product.name_tamil,
      pricePerKg: product.price_per_kg,
      quantity,
      cutType: "no_cut",
      cutOptions: [],
      needsCleaning: false,
      subtotal: product.price_per_kg * quantity
    };
    localStorage.setItem(cartKey, JSON.stringify([cartItem]));
    window.dispatchEvent(new Event('cartUpdated'));
    toast({
      title: "Proceeding to Checkout! ⚡",
      description: `${quantity}kg of ${product.name_english} - Redirecting to checkout...`,
    });
    window.location.href = "/checkout";
  };
  if (loading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12 flex-1">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-8 w-1/4 rounded" />
            </div>
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        </div>
        <Footer />
      </div>;
  }
  if (!product) return null;
  const total = product.price_per_kg * quantity;
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <DeliveryStatusBanner />
      
      <main className="container py-8 flex-1">
        <Button variant="ghost" onClick={() => navigate("/products")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
            {product.image_url ? <img src={product.image_url} alt={product.name_english} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-muted-foreground">
                No image available
              </div>}
          </div>

          {/* Product Details */}
          <div>
            <Badge className="mb-2">{product.category.replace("_", " ")}</Badge>
            <h1 className="text-4xl font-bold mb-2">{product.name_english}</h1>
            <p className="text-xl text-muted-foreground mb-4">{product.name_tamil}</p>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-primary">₹{product.price_per_kg}</span>
              <span className="text-muted-foreground">/kg</span>
            </div>

            {product.description && <p className="text-muted-foreground mb-6">{product.description}</p>}
            <Card className="mb-6">
              <CardContent className="pt-6 space-y-6">
                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.5"
                    min="1"
                    max={product.stock_type === 'count' ? product.count : product.stock_kg}
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val) && val < 1) {
                        notify.warning("Minimum quantity is 1 kg");
                      }
                      const rounded = Math.round(((isNaN(val) ? 1 : val) * 2)) / 2; // nearest 0.5
                      setQuantity(Math.max(1, rounded));
                    }}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.stock_type === 'count' ? (
                      <>Available: {product.count} pieces</>
                    ) : (
                      <>Available: {product.stock_kg}kg</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cut type and cleaning preferences can be selected during checkout
                  </p>
                </div>

                {/* Total */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-2xl text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={addToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" className="w-full" onClick={buyNow}>
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default ProductDetail;