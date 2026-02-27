export function getApiBaseUrl(): string {
  // API calls use relative URLs — Next.js proxies /api/v1/* to the backend at
  // runtime via next.config.ts rewrites.
  return "";
}
