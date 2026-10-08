import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./sw-register";

export const metadata: Metadata = {
  title: "Surat Solat",
  description: "Surat yang dibaca di setiap waktu solat",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* href relatif supaya ikut benar di GitHub Pages (basePath) */}
        <link rel="manifest" href="manifest.webmanifest" />
        <link rel="icon" href="icons/icon-192.png" type="image/png" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
