import type { ReactNode } from "react";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${sora.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
