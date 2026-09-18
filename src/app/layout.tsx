import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./orientation.css";
import "./refinements.css";
import { PrivacyPreferences } from "@/components/privacy-preferences";
export const metadata: Metadata = {
  title: "CampusPath AI — Trouve ta voie au Maroc",
  description:
    "Des parcours visuels pour explorer les études, découvrir les métiers et préparer son avenir au Maroc et à l’étranger.",
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
