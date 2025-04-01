import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Enhanced Compound Interest Calculator",
  description:
    "A modern and realistic compound interest calculator with advanced features for financial projections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <div className="min-h-screen bg-background">
          {/* Background elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-grid-white [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-primary/5 to-background"></div>
            <div className="absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
            <div className="absolute left-0 right-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          {/* Main content wrapper - KEY CHANGES HERE */}
          <main className="w-full max-w-[95%] lg:max-w-[90%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
