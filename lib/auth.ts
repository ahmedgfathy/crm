import { createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

const OWNER_MOBILE = process.env.OWNER_MOBILE ?? "01002778090";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "ZeroCall20!@H";
export const SESSION_COOKIE = "ctb_session";

export type Session = {
  role: string;
  mobile: string;
  userId?: string;
};

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function authenticateOwner(mobile: string, password: string): boolean {
  return mobile === OWNER_MOBILE && password === OWNER_PASSWORD;
}

export async function authenticateUser(mobile: string, password: string): Promise<Session | null> {
  if (authenticateOwner(mobile, password)) {
    return { role: "owner", mobile };
  }

  const user = await prisma.user.findFirst({
    where: { mobile, status: "ACTIVE" },
  });

  if (user && user.password && user.password === hashPassword(password)) {
    return { role: user.role || "user", mobile: user.mobile ?? mobile, userId: user.id };
  }

  return null;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Session;
    if (parsed?.role === "owner" && parsed?.mobile === OWNER_MOBILE) {
      return { role: "owner", mobile: OWNER_MOBILE };
    }
    if (parsed?.userId) {
      const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
      if (user && user.status === "ACTIVE") {
        return { role: user.role || "user", mobile: user.mobile ?? parsed.mobile ?? "", userId: user.id };
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

export async function logout() {
  "use server";
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
