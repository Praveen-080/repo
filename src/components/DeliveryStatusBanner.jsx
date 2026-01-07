import { useSettings } from "@/context/SettingsContext";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const DeliveryStatusBanner = () => {
  const { isAfterCutoff, message, loading } = useSettings();

  if (loading || !message) return null;

  return (
    <div className={`w-full ${isAfterCutoff ? 'bg-orange-600' : 'bg-green-600'} text-white`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          {isAfterCutoff ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" />
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <p className="text-xs md:text-sm font-medium">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
