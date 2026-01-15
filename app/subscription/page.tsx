import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import InternalHeader from "../../components/InternalHeader";
import { getSignupRequest, updateSignupContact } from "../../lib/signupStore";

type ActionState = { ok: boolean; error?: string };

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams?: { mobile?: string; email?: string; reset?: string; request?: string };
}) {
  const requestId = searchParams?.request?.trim();
  const mobile = searchParams?.mobile?.trim();
  const email = searchParams?.email?.trim();
  const reset = searchParams?.reset === "1";

  const payload = await (async () => {
    if (requestId) {
      const req = await getSignupRequest(requestId);
      if (req) return { mobile: req.mobile, email: req.email, company: req.company, status: req.status };
    }
    return { mobile, email, company: "Pending company", status: "PENDING" as const };
  })();

  async function updateContactAction(formData: FormData): Promise<void> {
    "use server";
    const id = (formData.get("id") as string)?.trim();
    const newMobile = (formData.get("mobile") as string)?.trim();
    const newEmail = (formData.get("email") as string)?.trim() || null;
    if (!id || !newMobile) return;
    await updateSignupContact(id, { mobile: newMobile, email: newEmail });
    revalidatePath("/subscription");
    redirect(`/subscription?request=${id}`);
  }

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
              <div className="mt-1 text-white">{payload.mobile ?? "Not provided"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
              <div className="text-slate-400 text-xs uppercase">Email</div>
              <div className="mt-1 text-white">{payload.email ?? "Not provided"}</div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
            <div className="text-slate-400 text-xs uppercase">Company</div>
            <div className="mt-1 text-white">{payload.company}</div>
          </div>

          {!payload.mobile && (
            <div className="card border-amber-400/30 bg-amber-400/10 text-amber-50 p-4 space-y-3 text-sm">
              <p className="font-semibold text-white">We need your mobile to proceed.</p>
              <form action={updateContactAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                <input type="hidden" name="id" value={requestId || ""} />
                <label className="space-y-1 text-slate-200 text-sm">
                  <span className="block text-xs text-slate-400">Mobile</span>
                  <input
                    name="mobile"
                    type="tel"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                    placeholder="0100 277 8090"
                  />
                </label>
                <label className="space-y-1 text-slate-200 text-sm">
                  <span className="block text-xs text-slate-400">Work email (optional)</span>
                  <input
                    name="email"
                    type="email"
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                    placeholder="ops@yourcompany.com"
                  />
                </label>
                <button type="submit" className="btn-primary text-sm h-10">Update</button>
              </form>
              <p className="text-xs text-amber-100">Submit your mobile here if it was missing from the previous step.</p>
            </div>
          )}

          {reset && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-50 px-4 py-3 text-sm">
              We noted your reset request. We’ll help you recover access.
            </div>
          )}

          <div className="card border-white/10 bg-white/5 text-slate-200 p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Status</p>
              <span className="pill">{payload.status}</span>
            </div>
            <p className="text-slate-300 text-sm">
              Your request is queued for admin approval. You’ll be contacted on the provided mobile/email.
            </p>
          </div>

          <div className="text-sm text-slate-300">
            Plan: Contaboo Unlimited — 2999 EGP / month. Unlimited users, bandwidth, and storage.
          </div>
        </div>
      </main>
    </div>
  );
}
