import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "todolist_jwt_secret_key_2026_super_secure"
);

export const AUTH_COOKIE_NAME = "todolist_session";

export interface UserSession {
  userId: string;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function createAuthToken(session: UserSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(
  token: string
): Promise<UserSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as unknown as UserSession;
    if (payload.userId && payload.username && payload.role) {
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7天
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
