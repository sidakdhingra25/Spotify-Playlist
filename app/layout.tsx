import { siteConfig } from "@/config/site"
import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { type Metadata } from "next"
import "./globals.css";
import { NavBar } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased bg-gradient-to-br from-black via-green-950 to-black",
          fontSans.variable,
          fontMono.variable
        )}
      >
         <NavBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
