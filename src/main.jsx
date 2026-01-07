import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Dev-only global error logging to pinpoint runtime crashes.
// This helps identify the exact file/line when the UI only shows a generic toast.
if (import.meta?.env?.DEV && typeof window !== "undefined") {
	if (!window.__SFM_GLOBAL_ERROR_HOOKS__) {
		window.__SFM_GLOBAL_ERROR_HOOKS__ = true;

		window.addEventListener("error", (event) => {
			console.error("[GlobalError]", event?.message, event?.error?.stack || event);
		});

		window.addEventListener("unhandledrejection", (event) => {
			console.error("[UnhandledRejection]", event?.reason?.message || event?.reason, event?.reason?.stack || event);
		});
	}
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Render app directly; allow native responsive layout and natural page height
createRoot(container).render(<App />);
