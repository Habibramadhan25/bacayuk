declare const process: {
  env?: {
    BACKEND_URL?: string;
    SERVER_URL?: string;
    [key: string]: string | undefined;
  };
} | undefined;

/**
 * Helper to resolve backend endpoint using Vercel binding (BACKEND_URL or SERVER_URL)
 * or fallback to relative path.
 */
export function getApiUrl(path: string): string {
  const backendUrl = (typeof process !== 'undefined' && (process?.env?.BACKEND_URL || process?.env?.SERVER_URL))
    ? (process.env.BACKEND_URL || process.env.SERVER_URL)
    : '';

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (backendUrl) {
    try {
      return new URL(cleanPath.replace(/^\//, ''), backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`).toString();
    } catch {
      return `${backendUrl.replace(/\/$/, '')}${cleanPath}`;
    }
  }

  return cleanPath;
}

