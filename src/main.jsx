import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Render app directly; allow native responsive layout and natural page height
createRoot(container).render(<App />);
