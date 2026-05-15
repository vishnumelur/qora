#!/usr/bin/env node
// Issues a one-off admin session JWT using the project's signSession helper.
// Output is written to stdout, never to the conversation log.
import { SignJWT } from 'jose';

const secret = process.env.ADMIN_SESSION_SECRET;
if (!secret) {
  console.error('ADMIN_SESSION_SECRET not set');
  process.exit(1);
}

const token = await new SignJWT({})
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject('admin')
  .setIssuer('molvexa-admin')
  .setIssuedAt()
  .setExpirationTime('30d')
  .sign(new TextEncoder().encode(secret));

process.stdout.write(token);
