"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, type ReactNode } from "react";

import { isLikelyValidClerkPublishableKey } from "@/auth/clerkKey";
import {
  clearLocalAuthToken,
  getLocalAuthToken,
  useIsLocalAuthMode,
} from "@/auth/localAuth";
import { LocalAuthLogin } from "@/components/organisms/LocalAuthLogin";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";

export function AuthProvider({ children }: { children: ReactNode }) {
  const localMode = useIsLocalAuthMode();
  const { clerkPublishableKey, clerkAfterSignOutUrl } = useRuntimeConfig();

  useEffect(() => {
    if (!localMode) {
      clearLocalAuthToken();
    }
  }, [localMode]);

  if (localMode) {
    if (!getLocalAuthToken()) {
      return <LocalAuthLogin />;
    }
    return <>{children}</>;
  }

  if (!isLikelyValidClerkPublishableKey(clerkPublishableKey)) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl={clerkAfterSignOutUrl}
    >
      {children}
    </ClerkProvider>
  );
}
