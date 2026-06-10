import type { User } from "@/types/auth";

export interface GoogleJwtPayload {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export function decodeGoogleCredential(credential: string): GoogleJwtPayload | null {
  const segments = credential.split(".");

  if (segments.length !== 3) return null;

  try {
    const base64Url = segments[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as GoogleJwtPayload;
  } catch {
    return null;
  }
}

export function isVerifiedGoogleCredential(payload: GoogleJwtPayload | null): payload is GoogleJwtPayload {
  return Boolean(payload?.sub && payload?.email_verified);
}

export function resolveGoogleSessionUser(payload: GoogleJwtPayload): User {
  const name = payload.name ?? payload.email?.split("@")[0] ?? "Google User";

  return {
    id: payload.sub ?? `google-${payload.email ?? "user"}`,
    name,
    email: payload.email ?? `${name.toLowerCase().replace(/\s+/g, ".")}@google.local`,
    company: "Google Account",
    role: "Authenticated User",
    avatarUrl: payload.picture,
    createdAt: new Date().toISOString(),
  };
}