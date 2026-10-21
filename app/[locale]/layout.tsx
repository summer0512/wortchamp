import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { createSiteStructuredData } from "@/lib/seo";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://wortchamp.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Wortchamp",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>
) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;
  const siteStructuredData = createSiteStructuredData(locale);
  const siteStructuredDataJson = JSON.stringify(siteStructuredData);

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <>
            <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteStructuredDataJson }} />
          </>
        </ThemeProvider>
      </body>
    </html>
  );
}
