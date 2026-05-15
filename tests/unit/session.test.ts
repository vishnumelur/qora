import { describe, it, expect, beforeEach } from 'vitest';
import { signSession, verifySession } from '@/server/auth/session';

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = 'a'.repeat(64);
});

describe('signSession + verifySession', () => {
  it('round-trips a valid token', async () => {
    const token = await signSession();
    const payload = await verifySession(token);
    expect(payload?.sub).toBe('admin');
  });

  it('returns null for a tampered token', async () => {
    const token = await signSession();
    const tampered = token.slice(0, -2) + 'xx';
    expect(await verifySession(tampered)).toBeNull();
  });

  it('returns null for empty/undefined input', async () => {
    expect(await verifySession('')).toBeNull();
    expect(await verifySession(undefined as unknown as string)).toBeNull();
  });
});
