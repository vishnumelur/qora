import { describe, it, expect, beforeEach } from 'vitest';
import { checkPassword, checkRateLimit, _resetRateLimitForTests } from '@/server/auth/password';

beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'correct horse battery staple';
  _resetRateLimitForTests();
});

describe('checkPassword', () => {
  it('returns true on exact match', () => {
    expect(checkPassword('correct horse battery staple')).toBe(true);
  });
  it('returns false on mismatch', () => {
    expect(checkPassword('wrong')).toBe(false);
  });
  it('does not short-circuit on length mismatch (returns false uniformly)', () => {
    expect(checkPassword('x')).toBe(false);
  });
});

describe('checkRateLimit', () => {
  it('allows up to 5 attempts then blocks the 6th', () => {
    const ip = '1.2.3.4';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip).blocked).toBe(false);
    }
    expect(checkRateLimit(ip).blocked).toBe(true);
  });

  it('is per-IP', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.1.1.1');
    expect(checkRateLimit('1.1.1.1').blocked).toBe(true);
    expect(checkRateLimit('2.2.2.2').blocked).toBe(false);
  });
});
