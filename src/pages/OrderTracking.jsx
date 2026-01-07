import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DeliveryTimer } from "@/components/DeliveryTimer";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { getFirestore, doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { app } from "@/integrations/firebase/firebase";
import { useAuth } from "@/context/AuthContext";

const db = getFirestore(app, 'shakthifishmarket');

const OrderTracking = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading, setShowLogin } = useAuth();
  
  useEffect(() => {
    let unsubscribeOrder = null;
    let unsubscribeHistory = null;
    let isActive = true;

    const userOwnsOrder = (orderData) => {
      const userId = user?.uid || user?.id;
      const userPhone = user?.phone || user?.phoneNumber;
      if (!orderData || !userId) return false;

      // New schema uses `user_id`, but older docs can vary.
      if (orderData.user_id && orderData.user_id === userId) return true;
      if (orderData.uid && orderData.uid === userId) return true;
      if (orderData.userId && orderData.userId === userId) return true;

      // Phone-based fallback (only if present on both sides)
      if (userPhone) {
        if (orderData.customer_phone && orderData.customer_phone === userPhone) return true;
        if (orderData.phone && orderData.phone === userPhone) return true;
      }

      return false;
    };

    const setupListeners = async () => {
      try {
        // Wait for auth to load before checking user
        if (authLoading) {
          console.log('[OrderTracking] Auth still loading...');
          return;
        }
        
        if (!user) {
          if (isActive) setShowLogin(true);
          return;
        }
        
        if (isActive) setLoading(true);
        
        // Set up real-time listener for order
        const orderRef = doc(db, 'orders', id);
        unsubscribeOrder = onSnapshot(orderRef, (docSnap) => {
          if (!isActive) return;

          if (!docSnap.exists()) {
            console.error('[OrderTracking] Order not found');
            navigate("/orders");
            return;
          }
          
          const orderData = { id: docSnap.id, ...docSnap.data() };
          
          // Verify user owns this order (support legacy field names too)
          if (!userOwnsOrder(orderData)) {
            console.error('[OrderTracking] Unauthorized access');
            navigate("/orders");
            return;
          }
          
          console.log('[OrderTracking] Order updated:', orderData.order_status);
          if (isActive) {
            setOrder(orderData);
            setOrderItems(Array.isArray(orderData.items) ? orderData.items : []);
            setLoading(false);
          }
        }, (error) => {
          console.error('[OrderTracking] Order listener error:', error);
          if (isActive) navigate("/orders");
        });
        
        // Set up real-time listener for order history
        // Removed orderBy to avoid requiring composite Firestore index; we'll sort client-side.
        // Project uses `order_status_history` (see backend collection list).
        // Keep backward-compat with older `order_history` if present.
        const historyCollections = ['order_status_history', 'order_history'];
        const historyUnsubs = [];
        const historyAggregate = new Map();

        historyCollections.forEach((collName) => {
          const historyQuery = query(
            collection(db, collName),
            where('order_id', '==', id)
          );

          const unsub = onSnapshot(historyQuery, (snapshot) => {
            if (!isActive) return;

            snapshot.docChanges().forEach((change) => {
              const key = `${collName}:${change.doc.id}`;
              if (change.type === 'removed') {
                historyAggregate.delete(key);
              } else {
                historyAggregate.set(key, { id: change.doc.id, ...change.doc.data() });
              }
            });

            const history = Array.from(historyAggregate.values());
            history.sort((a, b) => {
              const toMs = (ts) => {
                if (!ts) return 0;
                if (ts?.toDate) return ts.toDate().getTime();
                if (ts?.seconds) return ts.seconds * 1000;
                if (typeof ts === 'number') return ts < 1e12 ? ts * 1000 : ts;
                try { return new Date(ts).getTime(); } catch { return 0; }
              };
              return toMs(b.changed_at) - toMs(a.changed_at);
            });
            console.log('[OrderTracking] History updated (client-sorted):', history.length, 'entries');
            if (isActive) setOrderHistory(history);
          }, (error) => {
            console.error('[OrderTracking] History listener error:', error);
          });

          historyUnsubs.push(unsub);
        });
        
        unsubscribeHistory = () => {
          historyUnsubs.forEach((u) => {
            try {
              u();
            } catch (e) {
              console.error('[OrderTracking] Cleanup error:', e);
            }
          });
        };
      } catch (err) {
        console.error('[OrderTracking] Setup error:', err);
        if (isActive) {
          setLoading(false);
          navigate("/orders");
        }
      }
    };

    setupListeners();
    
    // Cleanup listeners on unmount
    return () => {
      console.log('[OrderTracking] Cleaning up listeners');
      isActive = false;
      if (unsubscribeOrder) {
        try { unsubscribeOrder(); } catch (e) { console.error('[OrderTracking] Cleanup error:', e); }
      }
      if (unsubscribeHistory) {
        try { unsubscribeHistory(); } catch (e) { console.error('[OrderTracking] Cleanup error:', e); }
      }
    };
  }, [id, user, authLoading, navigate, setShowLogin]);
  if (authLoading || loading || !order) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>;
  }
  const statuses = [
    { key: "pending", label: "Order Received" },
    { key: "confirmed", label: "Order Confirmed" },
    { key: "preparing", label: "Preparing / Cleaning" },
    (order?.delivery_type === "cash_on_delivery" || !order?.delivery_type)
      ? { key: "out_for_delivery", label: "Out for Delivery" }
      : { key: "ready_for_pickup", label: "Ready for Pickup" },
    { key: "delivered", label: "Completed" }
  ];
  const currentStatusIndex = statuses.findIndex(s => s.key === (order?.order_status || 'pending'));
  
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };
  
  // Robust date formatter for the Order Details section (handles Firestore Timestamp, epoch ms/sec, ISO string)
  const formatOrderDate = (createdAt) => {
    if (!createdAt) return '—';
    let dateObj;
    try {
      if (createdAt.toDate) {
        dateObj = createdAt.toDate();
      } else if (typeof createdAt === 'number') {
        // Distinguish between seconds vs milliseconds
        dateObj = new Date(createdAt < 1e12 ? createdAt * 1000 : createdAt);
      } else if (typeof createdAt === 'string') {
        dateObj = new Date(createdAt);
      } else if (createdAt.seconds !== undefined) {
        // Firestore timestamp plain object
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
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container py-8 flex-1">
        <h1 className="text-4xl font-bold mb-2">Order Tracking</h1>
        <p className="text-xl text-muted-foreground mb-8">Order #{order?.order_number || 'N/A'}</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Timeline - Only show for cash_on_delivery */}
          <div className="lg:col-span-2 space-y-6">
            {order?.delivery_type === "cash_on_delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {statuses.map((status, index) => <div key={status.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {index <= currentStatusIndex ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                          {index < statuses.length - 1 && <div className={`w-0.5 h-12 ${index < currentStatusIndex ? "bg-primary" : "bg-muted"}`} />}
                        </div>
                        <div className="pb-6">
                          <p className={`font-semibold ${index <= currentStatusIndex ? "text-foreground" : "text-muted-foreground"}`}>
                            {status.label}
                          </p>
                          {index === currentStatusIndex && <p className="text-sm text-primary flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Current Status
                            </p>}
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Order History */}
            {orderHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderHistory.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          {index < orderHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-muted mt-1" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">
                                {entry.old_status ? `${entry.old_status} → ` : ''}
                                <Badge variant={entry.new_status === 'delivered' ? 'default' : 'secondary'}>
                                  {entry.new_status}
                                </Badge>
                              </p>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {entry.notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                By {entry.changed_by_name || 'System'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateTime(entry.changed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(orderItems) && orderItems.length > 0 ? orderItems.map((item, idx) => <div key={idx} className="flex justify-between items-start pb-4 border-b last:border-0">
                      <div>
                        <p className="font-semibold">{item?.nameEnglish || 'Item'}</p>
                        <p className="text-sm text-muted-foreground">{item?.nameTamil || ''}</p>
                        <p className="text-sm mt-1">
                          {item?.quantity || 0}kg • {(item?.cutType || '').replace(/_/g, ' ')} • 
                          {item?.needsCleaning ? " Cleaning" : " No Cleaning"}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item?.subtotal || 0}</p>
                    </div>) : (
                    <p className="text-muted-foreground text-center py-4">No items in this order</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order?.delivery_type === "cash_on_delivery" && order?.created_at && order?.order_status && (
                  <div>
                    <DeliveryTimer createdAt={order.created_at} status={order.order_status} />
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">{formatOrderDate(order?.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Delivery Method</p>
                  <p className="font-semibold">
                    {order?.delivery_type === "cash_on_delivery" ? "Cash on Delivery" : "Self Pickup"}
                  </p>
                </div>

                {order?.delivery_address && <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-semibold">{order.delivery_address}</p>
                  </div>}

                {order?.customer_notes && <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{order.customer_notes}</p>
                  </div>}

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{order?.grand_total || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default OrderTracking;