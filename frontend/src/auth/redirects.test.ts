import { describe, expect, it } from "vitest";

import { resolveSignInRedirectUrl } from "@/auth/redirects";

describe("resolveSignInRedirectUrl", () => {
  it("uses fallbackOverride when redirect is missing", () => {
    expect(resolveSignInRedirectUrl(null, "/boards")).toBe("/boards");
  });

  it("defaults to /onboarding when no fallback is provided", () => {
    expect(resolveSignInRedirectUrl(null)).toBe("/onboarding");
  });

  it("allows safe relative paths", () => {
    expect(resolveSignInRedirectUrl("/dashboard?tab=ops#queue")).toBe(
      "/dashboard?tab=ops#queue",
    );
  });

  it("rejects protocol-relative urls", () => {
    expect(resolveSignInRedirectUrl("//evil.example.com/path", "/activity")).toBe(
      "/activity",
    );
  });

  it("rejects external absolute urls", () => {
    expect(resolveSignInRedirectUrl("https://evil.example.com/steal", "/activity")).toBe(
      "/activity",
    );
  });

  it("accepts same-origin absolute urls and normalizes to path", () => {
    const url = `${window.location.origin}/boards/new?src=invite#top`;
    expect(resolveSignInRedirectUrl(url)).toBe("/boards/new?src=invite#top");
  });
});
