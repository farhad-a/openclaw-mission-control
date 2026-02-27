import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DM_Serif_Display, IBM_Plex_Sans, Sora } from "next/font/google";

import { AuthMode } from "@/auth/mode";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { RuntimeConfigProvider } from "@/components/providers/RuntimeConfigProvider";
import { GlobalLoader } from "@/components/ui/global-loader";

// Runtime env vars — read by the server component on every request, NOT baked
// by webpack. Passed to client components via RuntimeConfigProvider context.
const authMode = (process.env.AUTH_MODE as AuthMode) || AuthMode.Local;
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";
const clerkAfterSignOutUrl = process.env.CLERK_AFTER_SIGN_OUT_URL ?? "/";
const clerkSignInFallbackRedirectUrl =
  process.env.CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/onboarding";

export const metadata: Metadata = {
  title: "OpenClaw Mission Control",
  description: "A calm command center for every task.",
};

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const headingFont = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${headingFont.variable} ${displayFont.variable} min-h-screen bg-app text-strong antialiased`}
      >
        <RuntimeConfigProvider
          authMode={authMode}
          clerkPublishableKey={clerkPublishableKey}
          clerkAfterSignOutUrl={clerkAfterSignOutUrl}
          clerkSignInFallbackRedirectUrl={clerkSignInFallbackRedirectUrl}
        >
          <AuthProvider>
            <QueryProvider>
              <GlobalLoader />
              {children}
            </QueryProvider>
          </AuthProvider>
        </RuntimeConfigProvider>
      </body>
    </html>
  );
}
