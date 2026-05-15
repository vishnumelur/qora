import 'server-only';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ALG = 'HS256';
const ISSUER = 'invenex-admin';

function key(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signSession(): Promise<string> {
  return await new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject('admin')
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key());
}

export async function verifySession(token: string | undefined | null): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: [ALG],
      issuer: ISSUER,
    });
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = 'invenex_admin';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
