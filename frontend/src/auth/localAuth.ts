"use client";

import { AuthMode } from "@/auth/mode";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";

let localToken: string | null = null;
const STORAGE_KEY = "mc_local_auth_token";

/**
 * Function-based check for non-React contexts (e.g. mutator.ts fetch wrapper).
 */
export function isLocalAuthMode(): boolean {
  return process.env.AUTH_MODE === AuthMode.Local;
}

/** Hook-based check for React components — reads from RuntimeConfigProvider. */
export function useIsLocalAuthMode(): boolean {
  const { authMode } = useRuntimeConfig();
  return authMode === AuthMode.Local;
}

export function setLocalAuthToken(token: string): void {
  localToken = token;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Ignore storage failures (private mode / policy).
  }
}

export function getLocalAuthToken(): string | null {
  if (localToken) return localToken;
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      localToken = stored;
      return stored;
    }
  } catch {
    // Ignore storage failures (private mode / policy).
  }
  return null;
}

export function clearLocalAuthToken(): void {
  localToken = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private mode / policy).
  }
}
