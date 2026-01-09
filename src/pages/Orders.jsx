import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryTimer } from "@/components/DeliveryTimer";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "@/integrations/firebase/firebase";

const db = getFirestore(app, 'shakthifishmarket');

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading, setShowLogin } = useAuth();
  
  // Robust date formatter (handles Firestore Timestamp, epoch ms/sec, ISO string, plain object)
  const formatOrderDate = (createdAt) => {
    if (!createdAt) return '—';
    let dateObj;
    try {
      if (createdAt.toDate) {
        dateObj = createdAt.toDate();
      } else if (typeof createdAt === 'number') {
        dateObj = new Date(createdAt < 1e12 ? createdAt * 1000 : createdAt);
      } else if (typeof createdAt === 'string') {
        dateObj = new Date(createdAt);
      } else if (createdAt.seconds !== undefined) {
        dateObj = new Date(createdAt.seconds * 1000);
      } else {
        dateObj = new Date(createdAt);
      }
      if (isNaN(dateObj.getTime())) return '—';
    } catch {
      return '—';
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nOrder = normalize(dateObj);
    const nToday = normalize(today);
    const nYesterday = normalize(yesterday);
    if (nOrder.getTime() === nToday.getTime()) return 'Today';
    if (nOrder.getTime() === nYesterday.getTime()) return 'Yesterday';
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  useEffect(() => {
    let unsubscribe = null;
    let isActive = true;

    const setupListener = async () => {
      try {
        // Wait for auth to load before checking user
        if (authLoading) {
          console.log('[Orders] Auth still loading...');
          return;
        }
        
        if (!user) {
          console.log('[Orders] No user, showing login');
          if (isActive) {
            setShowLogin(true);
          }
          return;
        }
        
        console.log('[Orders] Setting up listener for user:', user.uid || user.id);
        if (isActive) {
          setLoading(true);
        }
        // Set up real-time listener
        const q = query(
          collection(db, 'orders'),
          where('user_id', '==', user.uid || user.id)
        );
        
        unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          try {
            const ordersData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              ordersData.push({
                id: doc.id,
                ...data
              });
              console.log('[Orders] Order:', doc.id, 'Status:', data.order_status, 'Total:', data.grand_total);
            });
            // Sort client-side by created_at desc
            ordersData.sort((a, b) => {
              const toMs = (ts) => {
                if (!ts) return 0;
                if (ts.toDate) return ts.toDate().getTime();
                if (typeof ts === 'number') return ts < 1e12 ? ts * 1000 : ts;
                if (ts.seconds !== undefined) return ts.seconds * 1000;
                try { return new Date(ts).getTime(); } catch { return 0; }
              };
              return toMs(b.created_at) - toMs(a.created_at);
            });
            
            console.log('[Orders] Real-time update:', ordersData.length, 'orders loaded');
            if (isActive) {
              setOrders(ordersData || []);
              setLoading(false);
            }
          } catch (err) {
            console.error('[Orders] Error processing snapshot:', err);
            if (isActive) {
              setOrders([]);
              setLoading(false);
            }
          }
        }, 
        (error) => {
          console.error('[Orders] Listener error:', error);
          if (isActive) {
            setOrders([]);
            setLoading(false);
          }
        }
      );
      } catch (err) {
        console.error('[Orders] Setup error:', err);
        if (isActive) {
          setLoading(false);
          setOrders([]);
        }
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      console.log('[Orders] Cleaning up listener');
      isActive = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (e) {
          console.error('[Orders] Error during cleanup:', e);
        }
      }
    };
  }, [user, authLoading, setShowLogin]);
  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    preparing: "bg-purple-500",
    out_for_delivery: "bg-indigo-500",
    ready_for_pickup: "bg-green-500",
    delivered: "bg-green-600",
    cancelled: "bg-red-500"
  };
  
  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    ready_for_pickup: "Ready for Pickup",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        {authLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : loading ? <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
          </div> : !Array.isArray(orders) || orders.length === 0 ? <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to create your first order</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </CardContent>
          </Card> : <div className="space-y-4">
            {orders.map(order => <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/order-tracking/${order.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.order_number || 'N/A'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={statusColors[order.order_status] || 'bg-gray-500'}>
                      {statusLabels[order.order_status] || order.order_status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  {order.created_at && order.order_status && (
                    <div className="mb-4">
                      <DeliveryTimer createdAt={order.created_at} status={order.order_status} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {order.delivery_type === "cash_on_delivery" ? "Cash on Delivery" : "Self Pickup"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">₹{order.grand_total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </main>

      <Footer />
    </div>;
};
export default Orders;