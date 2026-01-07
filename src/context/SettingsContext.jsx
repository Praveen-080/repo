import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getStoreSettings } from '@/services/firestoreSettings';

const SettingsContext = createContext({
  loading: true,
  settings: null,
  cutoffTime: null,
  isAfterCutoff: false,
  message: '',
});

/**
 * Parse time string (e.g., "8:00 PM") to Date object for today
 */
function parseTimeToDate(timeStr) {
  if (!timeStr) return null;
  
  try {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    
    let [, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  } catch (error) {
    console.error('Failed to parse time:', timeStr, error);
    return null;
  }
}

/**
 * Format Date object to time string (e.g., "8:00 PM")
 */
function formatTime(date) {
  if (!(date instanceof Date)) return '';
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minutesStr} ${period}`;
}

export function SettingsProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[SettingsContext] Settings loading timeout - proceeding with null settings');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    (async () => {
      try {
        const data = await getStoreSettings();
        if (!mounted) return;
        setSettings(data || null);
        console.log('[SettingsContext] Settings loaded successfully:', data);
      } catch (error) {
        if (!mounted) return;
        console.error('[SettingsContext] Failed to load settings:', error);
        setSettings(null);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate cutoff time and message
  const { cutoffTime, isAfterCutoff, message } = useMemo(() => {
    const cutoffStr = settings?.delivery_cutoff || settings?.delivery?.cutoff_time || '8:00 PM';
    const openMsg = settings?.delivery_open_message || settings?.delivery?.open_message || '';
    const closedMsg = settings?.delivery_closed_message || settings?.delivery?.closed_message || '';
    
    console.log('[SettingsContext] Calculating delivery status:', {
      cutoffStr,
      openMsg,
      closedMsg,
      currentTime: new Date().toLocaleTimeString()
    });
    
    const cutoff = parseTimeToDate(cutoffStr);
    const isPastCutoff = cutoff ? new Date() > cutoff : false;
    
    const msg = isPastCutoff
      ? closedMsg || `Home delivery closed for today after ${formatTime(cutoff)}. Only self pickup available.`
      : openMsg || `Home delivery available until ${formatTime(cutoff)} today.`;
    
    return {
      cutoffTime: cutoff,
      isAfterCutoff: isPastCutoff,
      message: msg,
    };
  }, [settings]);

  const value = useMemo(
    () => ({
      loading,
      settings,
      cutoffTime,
      isAfterCutoff,
      message,
    }),
    [loading, settings, cutoffTime, isAfterCutoff, message]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
