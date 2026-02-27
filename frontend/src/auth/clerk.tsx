"use client";

// NOTE: We intentionally keep this file very small and dependency-free.
// It provides CI/secretless-build safe fallbacks for Clerk hooks/components.

import type { ReactNode, ComponentProps } from "react";

import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  SignOutButton as ClerkSignOutButton,
  useAuth as clerkUseAuth,
  useUser as clerkUseUser,
} from "@clerk/nextjs";

import { isLikelyValidClerkPublishableKey } from "@/auth/clerkKey";
import {
  getLocalAuthToken,
  useIsLocalAuthMode,
} from "@/auth/localAuth";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";

function hasLocalAuthToken(): boolean {
  return Boolean(getLocalAuthToken());
}

/** Hook-based check — reads from RuntimeConfigProvider context. */
export function useIsClerkEnabled(): boolean {
  const { clerkPublishableKey } = useRuntimeConfig();
  const localMode = useIsLocalAuthMode();
  if (localMode) return false;
  return isLikelyValidClerkPublishableKey(clerkPublishableKey);
}

export function SignedIn(props: { children: ReactNode }) {
  const localMode = useIsLocalAuthMode();
  const clerkEnabled = useIsClerkEnabled();
  if (localMode) {
    return hasLocalAuthToken() ? <>{props.children}</> : null;
  }
  if (!clerkEnabled) return null;
  return <ClerkSignedIn>{props.children}</ClerkSignedIn>;
}

export function SignedOut(props: { children: ReactNode }) {
  const localMode = useIsLocalAuthMode();
  const clerkEnabled = useIsClerkEnabled();
  if (localMode) {
    return hasLocalAuthToken() ? null : <>{props.children}</>;
  }
  if (!clerkEnabled) return <>{props.children}</>;
  return <ClerkSignedOut>{props.children}</ClerkSignedOut>;
}

// Keep the same prop surface as Clerk components so call sites don't need edits.
export function SignInButton(props: ComponentProps<typeof ClerkSignInButton>) {
  const clerkEnabled = useIsClerkEnabled();
  if (!clerkEnabled) return null;
  return <ClerkSignInButton {...props} />;
}

export function SignOutButton(
  props: ComponentProps<typeof ClerkSignOutButton>,
) {
  const clerkEnabled = useIsClerkEnabled();
  if (!clerkEnabled) return null;
  return <ClerkSignOutButton {...props} />;
}

export function useUser() {
  const localMode = useIsLocalAuthMode();
  const clerkEnabled = useIsClerkEnabled();
  if (localMode) {
    return {
      isLoaded: true,
      isSignedIn: hasLocalAuthToken(),
      user: null,
    } as const;
  }
  if (!clerkEnabled) {
    return { isLoaded: true, isSignedIn: false, user: null } as const;
  }
  return clerkUseUser();
}

export function useAuth() {
  const localMode = useIsLocalAuthMode();
  const clerkEnabled = useIsClerkEnabled();
  if (localMode) {
    const token = getLocalAuthToken();
    return {
      isLoaded: true,
      isSignedIn: Boolean(token),
      userId: token ? "local-user" : null,
      sessionId: token ? "local-session" : null,
      getToken: async () => token,
    } as const;
  }
  if (!clerkEnabled) {
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      getToken: async () => null,
    } as const;
  }
  return clerkUseAuth();
}

// Re-export ClerkProvider for places that want to mount it, but strongly prefer
// gating via useIsClerkEnabled() at call sites.
export { ClerkProvider };
