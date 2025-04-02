import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

// Get Google Analytics measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const metadata: Metadata = {
  title: "Enhanced Compound Interest Calculator | Financial Projections Tool",
  description:
    "Plan your financial future with our advanced compound interest calculator featuring inflation adjustment, realistic market volatility, and retirement planning.",
  keywords:
    "compound interest, investment calculator, retirement planning, financial calculator, investment growth",
  authors: [{ name: "OGSteve" }],
  metadataBase: new URL("https://compound-interest.net"),
  openGraph: {
    title: "Enhanced Compound Interest Calculator",
    description:
      "Advanced financial projection tool for realistic investment planning",
    url: "https://compound-interest.net",
    siteName: "Enhanced Compound Interest Calculator",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href="https://compound-interest.net" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        )}

        <div className="min-h-screen bg-background">
          {/* Background elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-grid-white [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-primary/5 to-background"></div>
            <div className="absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
            <div className="absolute left-0 right-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          {/* Main content wrapper */}
          <main className="w-full max-w-[95%] lg:max-w-[90%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
