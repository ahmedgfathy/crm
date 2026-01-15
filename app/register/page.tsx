import Link from "next/link";
import { redirect } from "next/navigation";
import InternalHeader from "../../components/InternalHeader";
import { createSignupRequest } from "../../lib/signupStore";

async function registerAction(formData: FormData) {
  "use server";
  const mobile = (formData.get("mobile") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  if (!mobile) {
    redirect("/register?error=missing");
  }
  const request = await createSignupRequest({ mobile, email: email || null, company: company || "Unnamed Company", password: password || null });
  redirect(`/subscription?request=${request.id}`);
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error === "missing" ? "Mobile is required." : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-lg mx-auto card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white">Create account</h1>
            <p className="muted">Start your subscription setup for your team.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form action={registerAction} className="space-y-4">
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
              <label className="text-sm text-slate-200" htmlFor="email">
                Work email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ops@yourcompany.com"
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="company">
                Company name
              </label>
              <input
                id="company"
                name="company"
                required
                placeholder="Contaboo Real Estate"
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="password">
                Desired password (saved for approval)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Set a password for later"
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-slate-400">We store it for the admin to provision; final auth can be set post-approval.</p>
            </div>

            <button type="submit" className="btn-primary w-full justify-center">
              Continue to subscription
            </button>
          </form>

          <div className="text-center text-sm text-slate-300">
            Already have access? <Link className="hover:text-white" href="/login">Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
