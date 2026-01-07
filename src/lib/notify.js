import { toast as sonner } from "@/components/ui/sonner";

export const notify = {
  success(message, opts = {}) {
    sonner.success(message, opts);
  },
  info(message, opts = {}) {
    sonner(message, { ...opts });
  },
  warning(message, opts = {}) {
    sonner.warning?.(message, opts) ?? sonner(message, { description: "", ...opts });
  },
  error(message, opts = {}) {
    if (import.meta?.env?.DEV) {
      console.warn('[notify.error]', message);
      console.warn(new Error(String(message))?.stack);
    }
    sonner.error(message, opts);
  },
};

export default notify;
