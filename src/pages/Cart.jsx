import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryStatusBanner } from "@/components/DeliveryStatusBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, authLoading, setShowLogin } = useAuth();
  const cartKey = user ? `cart_${user.uid || user.id}` : "cart";
    const loadCart = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      // Validate cart items
      const validCart = Array.isArray(cart) ? cart.filter(item => 
        item && 
        item.productId && 
        item.nameEnglish && 
        typeof item.pricePerKg === 'number' && 
        typeof item.quantity === 'number'
      ) : [];
      setCartItems(validCart);
      // Update localStorage with cleaned cart
      if (validCart.length !== cart.length) {
        localStorage.setItem(cartKey, JSON.stringify(validCart));
      }
    } catch (error) {
      console.error('[Cart] Error loading cart:', error);
      setCartItems([]);
      localStorage.setItem(cartKey, "[]");
    }
    }, [cartKey]);
    useEffect(() => {
      // Wait for auth to load before checking user
      if (authLoading) {
        console.log('[Cart] Auth still loading...');
        return;
      }
      
      // Check if user is logged in when viewing cart
      if (!user) {
        toast.error("Please sign in to view your cart");
        setShowLogin(true);
        navigate("/");
        return;
      }
      
      const t = setTimeout(() => {
        loadCart();
        setLoading(false);
      }, 120);
      return () => clearTimeout(t);
    }, [loadCart, user, authLoading, setShowLogin, navigate]);
  const removeItem = index => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    toast.success("Item removed from cart");
  };
  const clearCart = () => {
    localStorage.removeItem(cartKey);
    setCartItems([]);
    toast.success("Cart cleared");
  };
  const total = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + item.subtotal, 0) : 0;
  const totalWeight = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0;
  const FREE_DELIVERY_THRESHOLD = 5; // kg
  const isFreeDelivery = totalWeight >= FREE_DELIVERY_THRESHOLD;
  const cutTypeLabels = {
    no_cut: "Full piece",
    pieces: "Cut into pieces"
  };
  return <div className="min-h-screen flex flex-col">
      <Navbar cartItemCount={Array.isArray(cartItems) ? cartItems.length : 0} />
      <DeliveryStatusBanner />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {loading || cartItems === null ? <div className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-32"><Skeleton className="h-20 rounded" /></div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-1/3 rounded" />
                      <Skeleton className="h-4 w-1/4 rounded" />
                      <Skeleton className="h-4 w-1/6 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-10 rounded" />
                </div>
              </div>
              <div>
                <Skeleton className="h-48 rounded" />
              </div>
            </div>
          </div> : cartItems.length === 0 ? <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some fresh seafood to get started</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card> : <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.nameEnglish}</h3>
                        <p className="text-sm text-muted-foreground">{item.nameTamil}</p>
                        
                        <div className="mt-3 space-y-1 text-sm">
                          <p>Quantity: {item.quantity}kg</p>
                          <p>Cut: {cutTypeLabels[item.cutType]}
                            {item.cutType === "pieces" && item.cutOptions?.length > 0 
                              ? ` (${item.cutOptions[0].replace('_', ' ')})` 
                              : ""}
                          </p>
                          <p>Cleaning: {item.needsCleaning ? "Yes" : "No"}</p>
                          <p className="text-lg font-semibold text-primary mt-2">₹{item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}

              <Button variant="outline" onClick={clearCart} className="w-full">
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Weight</span>
                      <span className="font-medium">{totalWeight.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Delivery</span>
                      <span>
                        {isFreeDelivery 
                          ? <span className="text-green-600 font-medium">Free (≥{FREE_DELIVERY_THRESHOLD}kg)</span>
                          : "Calculated at checkout"}
                      </span>
                    </div>
                    {!isFreeDelivery && totalWeight > 0 && (
                      <div className="text-xs text-blue-600 font-medium">
                        Add {(FREE_DELIVERY_THRESHOLD - totalWeight).toFixed(1)}kg more for free delivery!
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={() => {
                      if (!user) {
                        toast.error("Please sign in to proceed to checkout");
                        setShowLogin(true);
                        return;
                      }
                      navigate("/checkout");
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>}
      </main>

      <Footer />
    </div>;
};
export default Cart;