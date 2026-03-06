// app/layout.tsx
import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  DM_Sans,
} from "next/font/google";
import "./globals.css";
import "./fonts.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToaster } from "@/components/providers/theme-toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://metaview.devsethi.site";
const SITE_NAME = "Metaview";
const SITE_DESCRIPTION =
  "Analyze meta tags, preview social cards across 9+ platforms, and get actionable fixes all from a single URL. Free and open source.";
const TWITTER_HANDLE = "@imsethidev";

export const metadata: Metadata = {
  title: {
    default: "Metaview | Analyze Meta Tags & Preview Social Cards Instantly",
    template: "%s | Metaview",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  keywords: [
    "meta tag analyzer",
    "open graph checker",
    "social card preview",
    "twitter card validator",
    "og image tester",
    "seo meta tags",
    "link preview tool",
    "meta tag debugger",
    "social media preview",
    "og tag checker",
    "metaview",
  ],

  authors: [
    {
      name: "Dev Sethi",
      url: "https://devsethi.site",
    },
  ],
  creator: "Dev Sethi",
  publisher: SITE_NAME,

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Metaview | Analyze Meta Tags & Preview Social Cards Instantly",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Metaview | Analyze meta tags. Preview social cards. Ship perfect links.",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: "Metaview | Analyze Meta Tags & Preview Social Cards",
    description: SITE_DESCRIPTION,
    images: {
      url: `${SITE_URL}/og-image.png`,
      alt: "Metaview | Analyze meta tags. Preview social cards. Ship perfect links.",
      width: 1200,
      height: 630,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  manifest: "/site.webmanifest",

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

  category: "developer tools",

  other: {
    "msapplication-TileColor": "#000000",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
