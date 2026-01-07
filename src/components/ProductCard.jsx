import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ProductCard = ({
  id,
  nameEnglish,
  nameTamil,
  category,
  pricePerKg,
  imageUrl,
  stockKg = 0,
  stockType = 'kg',
  count = 0
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setShowLogin } = useAuth();

  const cartKey = user ? `cart_${user.uid || user.id}` : "cart";
  
  // Determine actual stock value
  const stockValue = stockType === 'count' ? count : stockKg;
  const isInStock = stockValue > 0;

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      setShowLogin(true);
      return;
    }
    
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItemIndex = existingCart.findIndex(item => item.productId === id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      existingCart[existingItemIndex].quantity += 1;
      existingCart[existingItemIndex].subtotal = existingCart[existingItemIndex].quantity * pricePerKg;
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast({
        title: "Cart Updated! 🛒",
        description: `Updated ${nameEnglish} quantity to ${existingCart[existingItemIndex].quantity}kg.`,
      });
    } else {
      // Add new item to cart
      const cartItem = {
        productId: id,
        nameEnglish: nameEnglish,
        nameTamil: nameTamil,
        pricePerKg: pricePerKg,
        quantity: 1,
        cutType: "no_cut",
        cutOptions: [],
        needsCleaning: false,
        subtotal: pricePerKg * 1
      };
      existingCart.push(cartItem);
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast({
        title: "Added to Cart! 🛒",
        description: `1kg of ${nameEnglish} added to your cart.`,
      });
    }
  };

  const handleBuyNow = () => {
    // Go to product detail page
    navigate(`/product/${id}`);
  };

  const categoryLabels = {
    sea_fish: "Sea Fish (கடல் மீன்)",
    river_fish: "River Fish (ஆற்று மீன்)",
    crabs: "Crabs (நண்டு)",
    prawns: "Prawns (இறால்)",
    squid: "Squid (கணவாய்)",
  };
  return <Card className="h-full flex flex-col overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-md">
    <div className="relative aspect-square overflow-hidden bg-secondary/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nameEnglish}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/fish-generic.svg";
            }}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {categoryLabels[category]}
          </Badge>
        </div>
        <div className="min-h-12">
          <h3 className="font-semibold text-lg leading-tight">{nameEnglish}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{nameTamil}</p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">₹{pricePerKg}</span>
          <span className="text-sm text-muted-foreground">/kg</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {stockType === 'count' ? `Count: ${count} pieces available` : `Stock: ${stockKg}kg available`}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button 
          className="w-full rounded-full" 
          variant="outline"
          onClick={handleAddToCart} 
          disabled={!isInStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <Button 
          className="w-full rounded-full" 
          onClick={handleBuyNow} 
          disabled={!isInStock}
        >
          <Zap className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </CardFooter>
    </Card>;
};