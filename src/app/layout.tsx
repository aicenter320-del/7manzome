import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { site } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { pinar, pinarLatin } from "@/shared/ui/fonts";
import { AppProviders } from "@/shared/ui/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "طلای کودک",
    "هدیه طلا",
    "سکه کودک",
    "گنجینه طلا",
    "طلای نوزاد",
    "هدیه تولد کودک",
    "هفت منظومه",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="light" suppressHydrationWarning>
      <body
        className={cn(pinar.variable, pinarLatin.variable, pinar.className, "min-h-dvh antialiased")}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        <Toaster
          position="top-center"
          dir="rtl"
          closeButton
          toastOptions={{
            className: pinar.className,
            classNames: {
              toast: "glass-strong !border-transparent",
            },
          }}
        />
      </body>
    </html>
  );
}
