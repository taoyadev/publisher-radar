import { SITE_CONFIG } from '@/config/site';

export function getMetadataBase(): URL {
  const base = SITE_CONFIG.baseUrl || SITE_CONFIG.url;
  // Ensure trailing slash so `new URL('path', base)` behaves predictably.
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return new URL(normalized);
}

export function absoluteUrl(pathname: string = '/'): string {
  return new URL(pathname, getMetadataBase()).toString();
}

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

