import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// === Kiosk mode helpers ===

// Auto-hide cursor after 3 seconds of no movement
let cursorTimer: ReturnType<typeof setTimeout>;
function resetCursorTimer() {
  document.body.classList.remove("cursor-hidden");
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => {
    document.body.classList.add("cursor-hidden");
  }, 3000);
}
document.addEventListener("mousemove", resetCursorTimer);
document.addEventListener("touchstart", resetCursorTimer);
resetCursorTimer();

// Wake Lock API — prevent screen from sleeping
async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      await (navigator as any).wakeLock.request("screen");
    }
  } catch {
    // Wake lock not supported or denied — ignore
  }
}
requestWakeLock();
// Re-request on visibility change (e.g. tab switch back)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") requestWakeLock();
});

// Prevent pull-to-refresh on mobile
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// === App render ===

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
