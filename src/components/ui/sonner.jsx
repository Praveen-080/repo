/* eslint-disable react-refresh/only-export-components */
import { Toaster as Sonner, toast as originalToast } from "sonner";

// A lightweight wrapper around sonner's Toaster that doesn't require next-themes.
// Defaults to system theme but allows overriding via props.
const Toaster = (props) => {
  const theme = props?.theme ?? "system";
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Wrap toast methods to guard against HMR/library edge-case crashes
const safeToast = (message, opts) => {
  try {
    return originalToast(message, opts);
  } catch (err) {
    console.warn('[toast] Failed to show toast:', err);
  }
};
safeToast.success = (message, opts) => {
  try { return originalToast.success(message, opts); } catch (err) { console.warn('[toast.success] Failed:', err); }
};
safeToast.error = (message, opts) => {
  try { return originalToast.error(message, opts); } catch (err) { console.warn('[toast.error] Failed:', err); }
};
safeToast.warning = (message, opts) => {
  try { return originalToast.warning?.(message, opts); } catch (err) { console.warn('[toast.warning] Failed:', err); }
};
safeToast.info = (message, opts) => {
  try { return originalToast.info?.(message, opts); } catch (err) { console.warn('[toast.info] Failed:', err); }
};
safeToast.loading = (message, opts) => {
  try { return originalToast.loading?.(message, opts); } catch (err) { console.warn('[toast.loading] Failed:', err); }
};
safeToast.dismiss = (id) => {
  try { return originalToast.dismiss?.(id); } catch (err) { console.warn('[toast.dismiss] Failed:', err); }
};

export { Toaster, safeToast as toast };