declare const process: {
  env?: {
    SERVER_URL?: string;
    [key: string]: string | undefined;
  };
} | undefined;

/**
 * Utility for resolving backend API endpoints with Vercel service binding support (SERVER_URL)
 */
export function getApiUrl(path: string): string {
  const serverUrl = (typeof process !== 'undefined' && process?.env?.SERVER_URL)
    ? process.env.SERVER_URL
    : '';

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (serverUrl) {
    try {
      return new URL(cleanPath.replace(/^\//, ''), serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`).toString();
    } catch {
      return `${serverUrl.replace(/\/$/, '')}${cleanPath}`;
    }
  }

  return cleanPath;
}
