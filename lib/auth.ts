import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const OWNER_MOBILE = process.env.OWNER_MOBILE ?? "01002778090";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "ZeroCall20!@H";
export const SESSION_COOKIE = "ctb_session";

export type Session = {
  role: "owner";
  mobile: string;
};

export function authenticateOwner(mobile: string, password: string): boolean {
  return mobile === OWNER_MOBILE && password === OWNER_PASSWORD;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Session;
    if (parsed?.role === "owner" && parsed?.mobile) {
      return parsed;
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
