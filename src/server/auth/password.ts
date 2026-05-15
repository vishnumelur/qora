import 'server-only';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILS = 5;

const fails = new Map<string, { count: number; resetAt: number }>();

export function _resetRateLimitForTests(): void {
  fails.clear();
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set');
  return constantTimeEqual(input, expected);
}

export function checkRateLimit(ip: string): { blocked: boolean; retryAfter: number } {
  const now = Date.now();
  const rec = fails.get(ip);
  if (!rec || now > rec.resetAt) {
    fails.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false, retryAfter: 0 };
  }
  rec.count++;
  if (rec.count > MAX_FAILS) {
    return { blocked: true, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { blocked: false, retryAfter: 0 };
}

export function clearRateLimit(ip: string): void {
  fails.delete(ip);
}

function constantTimeEqual(a: string, b: string): boolean {
  // Always do a comparison loop over a fixed-length buffer to avoid leaking
  // length info via timing. If lengths differ, the loop still runs but the
  // result is forced to false.
  const al = Buffer.from(a, 'utf8');
  const bl = Buffer.from(b, 'utf8');
  if (al.length !== bl.length) {
    let dummy = 0;
    for (let i = 0; i < al.length; i++) dummy |= al[i] ^ al[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < al.length; i++) diff |= al[i] ^ bl[i];
  return diff === 0;
}
