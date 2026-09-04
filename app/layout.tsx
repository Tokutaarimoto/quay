import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Quay — MCP Server Registry",
  description:
    "A comprehensive registry of Model Context Protocol (MCP) servers. Browse, search, and discover MCP servers for your AI applications.",
  icons: {
    icon: "/icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Quay — MCP Server Registry",
    description:
      "A comprehensive registry of Model Context Protocol (MCP) servers. Browse, search, and discover MCP servers for your AI applications.",
    images: ["/og-image.png"],
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
