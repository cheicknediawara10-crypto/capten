/**
 * Helper to retrieve the official public base URL of CAPTEN.
 * Forces https://capten.app in production/Vercel environments,
 * while preserving localhost during local development.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    return 'https://capten.app';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://capten.app';
}
