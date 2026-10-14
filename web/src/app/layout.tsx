import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Digipack ERP | Sistem Rekomendasi Harga Jual Packaging",
  description: "Prototipe ERP Digipack dengan modul RFQ, Vendor Price, Quotation, dan Engine Rekomendasi Harga Jual berbasis Machine Learning untuk Skripsi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#090d14] text-[#f1f5f9]">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
