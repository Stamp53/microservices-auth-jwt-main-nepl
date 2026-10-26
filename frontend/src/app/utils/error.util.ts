/**
 * Cleanly parses backend error responses, removing HTTP status codes,
 * technical stack prefixes, and unescaping nested JSON strings.
 */
export function parseApiError(err: any): string {
  if (!err) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (err.status === 0) {
    return 'Network connection failed. Please ensure the API Gateway and backend services are running.';
  }

  // Extract raw string from error response
  let raw = '';
  if (typeof err === 'string') {
    raw = err;
  } else if (err.error?.error && typeof err.error.error === 'string') {
    raw = err.error.error;
  } else if (err.error?.message && typeof err.error.message === 'string') {
    raw = err.error.message;
  } else if (err.message && typeof err.message === 'string') {
    raw = err.message;
  } else if (err.error && typeof err.error === 'string') {
    raw = err.error;
  } else {
    raw = JSON.stringify(err);
  }

  // 1. Match nested JSON message: e.g. "{"message":"Username 'asdasd' is already taken"}"
  const messageMatch = raw.match(/\\?"message\\?"\s*:\s*\\?"([^\\"]+)\\?"/i);
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].trim();
  }

  // 2. Match nested JSON error: e.g. "{"error":"Invalid credentials"}"
  const errorMatch = raw.match(/\\?"error\\?"\s*:\s*\\?"([^\\"]+)\\?"/i);
  if (errorMatch && errorMatch[1]) {
    return errorMatch[1].trim();
  }

  // 3. If there is a colon-separated HTTP code, clean up technical prefix
  if (raw.includes(':') && (raw.includes('400') || raw.includes('500') || raw.includes('409') || raw.includes('404'))) {
    const parts = raw.split(':');
    const lastPart = parts[parts.length - 1].replace(/[\\"{}]/g, '').trim();
    if (lastPart.length > 3) {
      return lastPart;
    }
  }

  return raw;
}
