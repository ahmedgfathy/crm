import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

const OWNER_MOBILE = process.env.OWNER_MOBILE ?? "01002778090";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "ZeroCall20!@H";
export const SESSION_COOKIE = "ctb_session";

export type Session = {
  role: "owner" | "customer";
  mobile: string;
  requestId?: string;
};

export function authenticateOwner(mobile: string, password: string): boolean {
  return mobile === OWNER_MOBILE && password === OWNER_PASSWORD;
}

export async function authenticateUser(mobile: string, password: string): Promise<Session | null> {
  if (authenticateOwner(mobile, password)) {
    return { role: "owner", mobile };
  }

  const req = await prisma.signupRequest.findFirst({
    where: { mobile, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  if (req && req.password && req.password === password) {
    return { role: "customer", mobile: req.mobile, requestId: req.id };
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
    if (parsed?.role === "customer" && parsed?.requestId && parsed?.mobile) {
      const req = await prisma.signupRequest.findUnique({ where: { id: parsed.requestId } });
      if (req?.status === "APPROVED") {
        return { role: "customer", mobile: parsed.mobile, requestId: parsed.requestId };
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
