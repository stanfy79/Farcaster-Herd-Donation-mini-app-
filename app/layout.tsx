import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Farcaster Nigeria Onboarding Fund",
  description:
    "Help Nigerians join Farcaster by contributing to their onboarding fees. Support the growth of the Farcaster community in Nigeria.",
  generator: "v0.app",
  keywords: ["Farcaster", "Nigeria", "Crowdfunding", "Onboarding", "Crypto", "Community"],
  authors: [{ name: "Farcaster Nigeria Community" }],
  openGraph: {
    title: "Farcaster Nigeria Onboarding Fund",
    description: "Help Nigerians join Farcaster by contributing to their onboarding fees",
    images: ["/api/og-image"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farcaster Nigeria Onboarding Fund",
    description: "Help Nigerians join Farcaster by contributing to their onboarding fees",
    images: ["/api/og-image"],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "/api/og-image",
      button: {
        title: "🇳🇬 Support Nigeria",
        action: {
          type: "launch_miniapp",
          name: "Nigeria Farcaster Fund",
          url: process.env.NEXT_PUBLIC_APP_URL || "https://your-app-domain.com",
          splashImageUrl: "/api/splash-image",
          splashBackgroundColor: "#667eea",
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="fc:miniapp:name" content="Nigeria Farcaster Fund" />
        <meta property="fc:miniapp:icon" content="/api/icon" />
        <meta property="fc:miniapp:action:name" content="Support Nigeria" />
        <meta property="fc:miniapp:action:icon" content="smiley" />
        <meta property="fc:miniapp:action:splashImageUrl" content="/api/splash-image" />
        <meta property="fc:miniapp:action:splashBackgroundColor" content="#667eea" />
        <link rel="icon" href="/api/icon" type="image/png" />
        <link rel="apple-touch-icon" href="/api/icon" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  )
}
