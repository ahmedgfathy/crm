import InternalHeader from "../../components/InternalHeader";

export default function SubscriptionPage({
  searchParams,
}: {
  searchParams?: { mobile?: string; email?: string; reset?: string };
}) {
  const mobile = searchParams?.mobile;
  const email = searchParams?.email;
  const reset = searchParams?.reset === "1";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6 space-y-10">
        <div className="max-w-3xl mx-auto card p-8 space-y-4">
          <h1 className="text-3xl font-bold text-white">Subscription setup</h1>
          <p className="muted">
            We’ll finalize your flat monthly plan and provision your workspace. A Contaboo specialist will contact you shortly.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
              <div className="text-slate-400 text-xs uppercase">Mobile</div>
              <div className="mt-1 text-white">{mobile ?? "Not provided"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
              <div className="text-slate-400 text-xs uppercase">Email</div>
              <div className="mt-1 text-white">{email ?? "Not provided"}</div>
            </div>
          </div>

          {reset && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-50 px-4 py-3 text-sm">
              We noted your reset request. We’ll help you recover access.
            </div>
          )}

          <div className="text-sm text-slate-300">
            Plan: Contaboo Unlimited — 2999 EGP / month. Unlimited users, bandwidth, and storage.
          </div>
        </div>
      </main>
    </div>
  );
}
