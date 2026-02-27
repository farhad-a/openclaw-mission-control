"use client";

import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

import { useIsLocalAuthMode } from "@/auth/localAuth";
import { resolveSignInRedirectUrl } from "@/auth/redirects";
import { LocalAuthLogin } from "@/components/organisms/LocalAuthLogin";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const localMode = useIsLocalAuthMode();
  const { clerkSignInFallbackRedirectUrl } = useRuntimeConfig();

  if (localMode) {
    return <LocalAuthLogin />;
  }

  const forceRedirectUrl = resolveSignInRedirectUrl(
    searchParams.get("redirect_url"),
    clerkSignInFallbackRedirectUrl,
  );

  // Dedicated sign-in route for Cypress E2E.
  // Avoids modal/iframe auth flows and gives Cypress a stable top-level page.
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl={forceRedirectUrl}
      />
    </main>
  );
}
