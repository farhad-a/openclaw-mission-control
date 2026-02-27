import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import GlobalApprovalsPage from "./page";
import { AuthMode } from "@/auth/mode";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { RuntimeConfigProvider } from "@/components/providers/RuntimeConfigProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/approvals",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("next/link", () => {
  type LinkProps = React.PropsWithChildren<{
    href: string | { pathname?: string };
  }> &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

  return {
    default: ({ href, children, ...props }: LinkProps) => (
      <a href={typeof href === "string" ? href : "#"} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock("@clerk/nextjs", () => {
  return {
    ClerkProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    SignedIn: () => {
      throw new Error(
        "@clerk/nextjs SignedIn rendered (unexpected in secretless mode)",
      );
    },
    SignedOut: () => {
      throw new Error("@clerk/nextjs SignedOut rendered without ClerkProvider");
    },
    SignInButton: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    SignOutButton: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useAuth: () => ({ isLoaded: true, isSignedIn: false }),
    useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  };
});

describe("/approvals auth boundary", () => {
  it("renders without ClerkProvider runtime errors when publishable key is a placeholder", () => {
    window.sessionStorage.clear();

    render(
      <RuntimeConfigProvider
        authMode={AuthMode.Local}
        clerkPublishableKey="placeholder"
        clerkAfterSignOutUrl="/"
        clerkSignInFallbackRedirectUrl="/onboarding"
      >
        <AuthProvider>
          <QueryProvider>
            <GlobalApprovalsPage />
          </QueryProvider>
        </AuthProvider>
      </RuntimeConfigProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /local authentication/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/access token/i)).toBeInTheDocument();

    window.sessionStorage.clear();
  });
});
