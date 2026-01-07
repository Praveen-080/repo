import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const DeliveryTimer = ({ createdAt, status }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    try {
      // Hide timer for completed/cancelled
      if (status === 'delivered' || status === 'cancelled') {
        setTimeRemaining(null);
        return;
      }

      const parseOrderTime = () => {
        if (!createdAt) return null;
        try {
          if (createdAt.toDate) return createdAt.toDate();
          if (typeof createdAt === 'number') return new Date(createdAt < 1e12 ? createdAt * 1000 : createdAt);
          if (typeof createdAt === 'string') return new Date(createdAt);
          if (createdAt.seconds !== undefined) return new Date(createdAt.seconds * 1000);
          return new Date(createdAt);
        } catch {
          return null;
        }
      };

      const calculateTimeRemaining = () => {
        const orderTime = parseOrderTime();
        if (!orderTime || isNaN(orderTime.getTime())) {
          return null; // invalid timestamp; don't render timer
        }
        const deliveryTimeMs = 120 * 60 * 1000; // 120 minutes
        const targetTime = new Date(orderTime.getTime() + deliveryTimeMs);
        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
          return { expired: true, minutes: 0, seconds: 0 };
        }
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return { expired: false, minutes, seconds };
      };

      // Initial
      setTimeRemaining(calculateTimeRemaining());

      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 1000);
      return () => clearInterval(interval);
    } catch (e) {
      console.error('[DeliveryTimer] Error initializing timer:', e);
      setTimeRemaining(null);
    }
  }, [createdAt, status]);

  if (!timeRemaining || status === 'delivered' || status === 'cancelled') return null;
  const { expired, minutes, seconds } = timeRemaining;
  if (expired) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
        <Clock className="h-4 w-4" />
        <span>Expected delivery time passed</span>
      </div>
    );
  }
  const getColorClass = () => {
    if (minutes < 15) return 'text-red-600';
    if (minutes < 30) return 'text-orange-600';
    return 'text-green-600';
  };
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${getColorClass()}`}>
      <Clock className="h-4 w-4" />
      <span>{minutes > 0 ? `${minutes}m ` : ''}{seconds}s remaining</span>
    </div>
  );
};
