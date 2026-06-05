import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "RedHorn",
  description: "Gestionale operativo per clienti, progetti e finanze creative",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
