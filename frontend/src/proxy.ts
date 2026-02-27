import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { isLikelyValidClerkPublishableKey } from "@/auth/clerkKey";
import { AuthMode } from "@/auth/mode";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8000").replace(
    /\/+$/,
    "",
  );
}

const isClerkEnabled = () =>
  process.env.AUTH_MODE !== AuthMode.Local &&
  isLikelyValidClerkPublishableKey(process.env.CLERK_PUBLISHABLE_KEY);

// Public routes include home and sign-in paths to avoid redirect loops.
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

function isClerkInternalPath(pathname: string): boolean {
  // Clerk may hit these paths for internal auth/session refresh flows.
  return pathname.startsWith("/_clerk") || pathname.startsWith("/v1/");
}

function requestOrigin(req: Request): string {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host");
  const proto = forwardedProto ?? "http";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

function returnBackUrlFor(req: Request): string {
  const { pathname, search, hash } = new URL(req.url);
  return `${requestOrigin(req)}${pathname}${search}${hash}`;
}

// ---------------------------------------------------------------------------
// Clerk handler (always instantiated; only invoked when Clerk is enabled)
// ---------------------------------------------------------------------------

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isClerkInternalPath(new URL(req.url).pathname)) {
    return NextResponse.next();
  }
  if (isPublicRoute(req)) return NextResponse.next();

  // Use redirectToSignIn() (instead of protect()) for unauthenticated requests.
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: returnBackUrlFor(req) });
  }

  return NextResponse.next();
});

// ---------------------------------------------------------------------------
// Main proxy (Next.js 16 convention: named `proxy` export)
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // 1. API proxy: rewrite /api/v1/* to backend at runtime
  if (request.nextUrl.pathname.startsWith("/api/v1/")) {
    const target = new URL(
      `${getBackendUrl()}${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.rewrite(target);
  }

  // 2. Clerk auth middleware (when enabled)
  if (isClerkEnabled()) {
    return clerkHandler(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_clerk|v1|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
