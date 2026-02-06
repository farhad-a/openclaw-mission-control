"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

function isLikelyValidClerkPublishableKey(key: string | undefined): key is string {
  if (!key) return false;
  // Clerk publishable keys look like: pk_test_... or pk_live_...
  // In CI we want builds to stay secretless; if the key isn't present/valid,
  // we skip Clerk entirely so `next build` can prerender.
  return /^pk_(test|live)_[A-Za-z0-9]+$/.test(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!isLikelyValidClerkPublishableKey(publishableKey)) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
