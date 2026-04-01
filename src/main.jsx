import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@southdevs/capacitor-google-auth";
import App from "./App.jsx";
import "./index.css";
import { validateAppEnv } from "./lib/envValidation";
import { resolveGoogleWebClientId } from "./lib/googleAuthConfig";

validateAppEnv();

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
	const { clientId: googleClientId, source } = resolveGoogleWebClientId();
	console.log("[GoogleAuth] Native startup init started", {
		platform: Capacitor.getPlatform(),
		clientIdSource: source,
		hasClientId: !!googleClientId,
	});

	if (source !== "env") {
		console.warn("[GoogleAuth] Missing VITE_GOOGLE_WEB_CLIENT_ID. Using fallback client ID.");
	}

	void (async () => {
		try {
			await GoogleAuth.initialize({
				clientId: googleClientId,
				scopes: ["profile", "email"],
				grantOfflineAccess: true,
			});
			console.log("[GoogleAuth] Native startup init success");
		} catch (error) {
			console.error("[GoogleAuth] Initialization failed:", error);
		}
	})();
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Render app directly; allow native responsive layout and natural page height
createRoot(container).render(<App />);
