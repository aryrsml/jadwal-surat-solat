"use client";

import { useEffect } from "react";

/** Daftarkan service worker hanya di production, supaya cache tidak mengganggu `npm run dev`. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // Path relatif: otomatis benar di root domain maupun di GitHub Pages (/nama-repo/).
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {
      /* PWA hanya bonus: kalau gagal, aplikasi tetap jalan normal */
    });
  }, []);

  return null;
}
