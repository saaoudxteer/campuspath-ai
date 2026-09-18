import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./orientation.css";
import "./refinements.css";
import { PrivacyPreferences } from "@/components/privacy-preferences";
export const metadata: Metadata = {
  title: "CampusPath & Company — Conseil en Stratégie d'Orientation & Études Supérieures",
  description:
    "Analyses stratégiques, trajectoires d'excellence et préparation rigoureuse aux filières post-bac et supérieures au Maroc et à l'international.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}<PrivacyPreferences /></body>
    </html>
  );
}
