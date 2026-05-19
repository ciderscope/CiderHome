import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./AppProviders";

export const metadata: Metadata = {
  title: "Gestion Cuverie Cidricole",
  description: "Gestion multi-site de cuverie, transferts, tracabilite et analyses cidricoles."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

