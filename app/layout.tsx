import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://git-glyph.vercel.app").replace(/\/+$/, "");

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090d13" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "GitGlyph — Self-Hosted Dynamic GitHub Stats & SVG Cards for READMEs",
    template: "%s | GitGlyph",
  },
  description:
    "Generate lightning-fast, edge-cached dynamic GitHub stats, contribution streaks, top languages, and repository cards for your GitHub profile README. Zero query parameter clutter, 5,000 req/hr rate limit with classic PAT, and instant Vercel Edge caching.",
  applicationName: "GitGlyph",
  authors: [{ name: "AhmedTrooper", url: "https://github.com/AhmedTrooper" }],
  creator: "AhmedTrooper",
  publisher: "AhmedTrooper",
  keywords: [
    "GitHub Stats",
    "GitHub Readme Stats",
    "GitHub Profile Stats",
    "Contribution Streak SVG",
    "Dynamic GitHub SVG",
    "Top Languages Card",
    "Pinned Repository Card",
    "Self-Hosted GitHub Stats",
    "Vercel Edge SVG",
    "GitHub Profile Customization",
    "Developer Portfolio Readme",
    "Open Source GitHub Badges",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "GitGlyph — Self-Hosted Dynamic GitHub Stats & SVG Cards for READMEs",
    description:
      "Generate beautiful, edge-cached dynamic GitHub SVG cards for your profile README. Self-hosted on Vercel with zero parameter clutter and 5,000 req/hr GitHub GraphQL limits.",
    siteName: "GitGlyph",
    images: [
      {
        url: `${appUrl}/api/stats?theme=tokyo-night`,
        width: 1200,
        height: 630,
        alt: "GitGlyph GitHub Stats Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGlyph — Self-Hosted Dynamic GitHub Stats & SVG Cards",
    description:
      "Generate beautiful, edge-cached dynamic GitHub SVG cards for your profile README. Self-hosted on Vercel with clean URLs.",
    images: [`${appUrl}/api/stats?theme=tokyo-night`],
    creator: "@ahmedtrooper",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GitGlyph",
  url: appUrl,
  description:
    "Generate edge-cached dynamic GitHub SVG stats, contribution streaks, top languages, and pinned repository cards for profile READMEs.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript and modern browser.",
  softwareVersion: "1.0.0",
  author: {
    "@type": "Person",
    "name": "AhmedTrooper",
    "url": "https://github.com/AhmedTrooper",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  keywords: "GitHub stats, README stats, dynamic SVG generator, GitHub profile cards, developer tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
