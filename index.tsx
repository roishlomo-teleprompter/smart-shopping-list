import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// DEBUG: catch silent crashes in production
window.addEventListener("error", (e) => {
  console.error("WINDOW_ERROR:", (e as any)?.message, (e as any)?.error);
  alert("WINDOW_ERROR: " + ((e as any)?.message || "unknown"));
});

window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
  console.error("UNHANDLED_REJECTION:", e?.reason);
  try {
    const txt = typeof e?.reason === "string" ? e.reason : JSON.stringify(e.reason);
    alert("UNHANDLED_REJECTION: " + txt);
  } catch {
    alert("UNHANDLED_REJECTION (non-serializable)");
  }
});

console.log("BOOT_OK:", new Date().toISOString());

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
