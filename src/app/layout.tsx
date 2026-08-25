import type { Metadata } from "next";
import { fontVariables } from "@/styles/fonts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SL by Hammah",
    template: "%s | SL by Hammah",
  },
  description: "Premium African fashion from SL by Hammah.",
  metadataBase: new URL("https://slbyhammah.com"),
  icons: {
    icon: "/images/hammah/global/logo/favicon.png",
  },
  openGraph: {
    title: "SL by Hammah",
    description: "Premium African fashion from SL by Hammah.",
    images: [
      {
        url: "/images/hammah/global/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "SL by Hammah",
      },
    ],
    type: "website",
    siteName: "SL by Hammah",
  },
  twitter: {
    card: "summary_large_image",
    title: "SL by Hammah",
    description: "Premium African fashion from SL by Hammah.",
    images: ["/images/hammah/global/logo/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
