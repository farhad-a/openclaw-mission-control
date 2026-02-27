"use client";

import { createContext, useContext, type ReactNode } from "react";

import { AuthMode } from "@/auth/mode";

export interface RuntimeConfig {
  authMode: AuthMode;
  clerkPublishableKey: string;
  clerkAfterSignOutUrl: string;
  clerkSignInFallbackRedirectUrl: string;
}

const RuntimeConfigContext = createContext<RuntimeConfig>({
  authMode: AuthMode.Local,
  clerkPublishableKey: "",
  clerkAfterSignOutUrl: "/",
  clerkSignInFallbackRedirectUrl: "/onboarding",
});

export function RuntimeConfigProvider({
  children,
  ...config
}: RuntimeConfig & { children: ReactNode }) {
  return (
    <RuntimeConfigContext value={config}>{children}</RuntimeConfigContext>
  );
}

export function useRuntimeConfig(): RuntimeConfig {
  return useContext(RuntimeConfigContext);
}
