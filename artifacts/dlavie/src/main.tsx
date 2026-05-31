import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV) {
  const _origError = window.onerror;
  window.onerror = (msg, src, line, col, err) => {
    if (typeof msg === 'string' && msg.toLowerCase().includes('webgl')) return true;
    if (err && err.message && err.message.toLowerCase().includes('webgl')) return true;
    return _origError ? _origError(msg, src, line, col, err) : false;
  };
  window.addEventListener('unhandledrejection', (e) => {
    const msg = e?.reason?.message ?? String(e?.reason ?? '');
    if (msg.toLowerCase().includes('webgl')) e.preventDefault();
  });
}

createRoot(document.getElementById("root")!).render(<App />);


if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/dlavie-ai-sw.js")
      .catch(() => undefined);
  });
}
