import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser, SESSION_COOKIE } from "../../lib/auth";
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
  const errorMessage =
    error === "missing"
      ? "Please enter mobile and password."
      : error === "invalid"
      ? "Invalid credentials."
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-lg mx-auto card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white">Sign in</h1>
            <p className="muted">Use your mobile number to access the dashboard.</p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="mobile">
                Mobile number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                placeholder="0100 277 8090"
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button type="submit" name="intent" value="login" className="btn-primary w-full justify-center">
              Sign in
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <Link href="/register" className="hover:text-white">
              Register
            </Link>
            <Link href="/reset" className="hover:text-white">
              Forgot password?
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
