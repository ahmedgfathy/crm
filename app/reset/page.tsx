import Link from "next/link";
import { redirect } from "next/navigation";
import InternalHeader from "../../components/InternalHeader";

async function resetAction(formData: FormData) {
  "use server";
  const mobile = (formData.get("mobile") as string)?.trim();
  if (!mobile) {
    redirect("/reset?error=missing");
  }
  // Placeholder: would send OTP/SMS reset; here we route to subscription/contact.
  redirect(`/subscription?reset=1&mobile=${encodeURIComponent(mobile)}`);
}

export default function ResetPage({
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
            <h1 className="text-3xl font-bold text-white">Reset password</h1>
            <p className="muted">Enter your mobile number and we’ll guide you through reset.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form action={resetAction} className="space-y-4">
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

            <button type="submit" className="btn-primary w-full justify-center">
              Send reset steps
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <Link href="/login" className="hover:text-white">Back to login</Link>
            <Link href="/register" className="hover:text-white">Create account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
