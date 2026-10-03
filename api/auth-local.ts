import crypto from "crypto";
import * as jose from "jose";
import * as cookie from "cookie";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import {
  countAdmins,
  findUserByEmail,
  findUserByGoogleId,
  findUserByUnionId,
  insertUser,
  touchSignIn,
} from "./queries/users";

const JWT_ALG = "HS256";

type SessionPayload = { unionId: string; clientId: string };

export async function signSessionToken(payload: SessionPayload) {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    if (!payload.unionId) return null;
    return { unionId: payload.unionId as string, clientId: "local" };
  } catch {
    return null;
  }
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

// ---------- Passwords (scrypt, built into Node) ----------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

// ---------- Helpers ----------

async function issueSession(c: Context, unionId: string) {
  const token = await signSessionToken({ unionId, clientId: "local" });
  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, {
    ...cookieOpts,
    maxAge: Session.maxAgeMs / 1000,
  });
}

async function isFirstAdmin(email: string) {
  if (env.adminEmail && email.toLowerCase() === env.adminEmail) return true;
  // Bootstrap: if no admin exists yet, the first registered account becomes admin
  return (await countAdmins()) === 0;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Email + password ----------

export async function handleRegister(c: Context) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid request body" }, 400);
  }
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || name.length > 255) {
    return c.json({ error: "Please enter your name." }, 400);
  }
  if (!emailRegex.test(email)) {
    return c.json({ error: "Please enter a valid email address." }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters." }, 400);
  }
  if (await findUserByEmail(email)) {
    return c.json({ error: "An account with this email already exists." }, 409);
  }

  const admin = await isFirstAdmin(email);
  const unionId = `email:${email}`;
  await insertUser({
    unionId,
    name,
    email,
    passwordHash: hashPassword(password),
    role: admin ? "admin" : "user",
    membershipStatus: admin ? "approved" : "pending",
    lastSignInAt: new Date(),
  });

  await issueSession(c, unionId);
  return c.json({ ok: true, admin });
}

export async function handleLogin(c: Context) {
  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid request body" }, 400);
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const user = await findUserByEmail(email);
  if (
    !user ||
    !user.passwordHash ||
    !verifyPassword(password, user.passwordHash)
  ) {
    return c.json({ error: "Incorrect email or password." }, 401);
  }

  await touchSignIn(user.id);
  await issueSession(c, user.unionId);
  return c.json({ ok: true });
}

// ---------- Google OAuth ----------

function googleConfigured() {
  return !!(env.googleClientId && env.googleClientSecret);
}

function originOf(c: Context) {
  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("x-forwarded-host") ?? c.req.header("host") ?? "";
  return `${proto}://${host}`;
}

export async function handleGoogleStart(c: Context) {
  if (!googleConfigured()) {
    return c.html(
      `<html><body style="font-family:sans-serif;max-width:32rem;margin:4rem auto">
        <h2>Google sign-in isn't set up yet</h2>
        <p>The site owner needs to add free Google credentials
        (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) to the server
        configuration. Please use email sign-in for now.</p>
        <p><a href="/login">Back to login</a></p>
      </body></html>`,
      501,
    );
  }
  const redirectUri = `${originOf(c)}/api/auth/google/callback`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  return c.redirect(url.toString(), 302);
}

export async function handleGoogleCallback(c: Context) {
  if (!googleConfigured()) {
    return c.redirect("/login?error=google-not-configured", 302);
  }
  const code = c.req.query("code");
  if (!code) {
    return c.redirect("/login?error=google-cancelled", 302);
  }
  try {
    const redirectUri = `${originOf(c)}/api/auth/google/callback`;
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });
    if (!tokenResp.ok) throw new Error(`token exchange ${tokenResp.status}`);
    const tokens = (await tokenResp.json()) as { access_token?: string };
    if (!tokens.access_token) throw new Error("no access token");

    const profileResp = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!profileResp.ok) throw new Error(`userinfo ${profileResp.status}`);
    const profile = (await profileResp.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!profile.sub || !profile.email) throw new Error("incomplete profile");

    const email = profile.email.toLowerCase();
    let user = await findUserByGoogleId(profile.sub);
    if (!user) {
      user = await findUserByEmail(email);
    }
    if (!user) {
      const admin = await isFirstAdmin(email);
      const unionId = `google:${profile.sub}`;
      await insertUser({
        unionId,
        name: profile.name ?? email,
        email,
        googleId: profile.sub,
        avatar: profile.picture ?? null,
        role: admin ? "admin" : "user",
        membershipStatus: admin ? "approved" : "pending",
        lastSignInAt: new Date(),
      });
      await issueSession(c, unionId);
    } else {
      await touchSignIn(user.id);
      await issueSession(c, user.unionId);
    }
    return c.redirect("/", 302);
  } catch (e) {
    console.error("[google-auth]", e);
    return c.redirect("/login?error=google-failed", 302);
  }
}
