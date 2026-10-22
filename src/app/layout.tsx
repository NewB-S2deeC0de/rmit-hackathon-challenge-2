import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "ScopeZero | Demo MVP", description: "Supplier-reported batch PCF demo with simulated TideCloak access" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
