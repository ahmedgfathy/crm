import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser, SESSION_COOKIE } from "../../lib/auth";
import { LoginClient } from "./LoginClient";
import InternalHeader from "../../components/InternalHeader";

async function loginAction(formData: FormData) {
  "use server";
  const mobile = (formData.get("mobile") as string)?.trim();
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string;

  if (intent === "logout") {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    redirect("/login");
  }

  if (!mobile || !password) {
    redirect("/login?error=missing");
  }

  const session = await authenticateUser(mobile, password);
  if (!session) {
    redirect("/login?error=invalid");
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const errorKey = error === "missing" ? "login.error.missing" : error === "invalid" ? "login.error.invalid" : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <LoginClient loginAction={loginAction} errorKey={errorKey} />
    </div>
  );
}
