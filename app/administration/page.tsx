import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { createSubscriptionPlan, listSubscriptionPlans, setSubscriptionPlanActive, updateSubscriptionPlan } from "../../lib/subscriptionPlans";
import { listSignupRequests, updateSignupPlan, updateSignupStatus, updateSignupPassword } from "../../lib/signupStore";

type TabKey = "plans" | "approvals";

async function approveAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string) ?? "";
  await updateSignupStatus(id, "APPROVED");
}

async function rejectAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string) ?? "";
  const note = (formData.get("note") as string) ?? undefined;
  await updateSignupStatus(id, "REJECTED", note);
}

async function setPasswordAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  if (!id || !password) return;
  await updateSignupPassword(id, password);
}

async function createPlanAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const billingCycle = (formData.get("billingCycle") as string)?.trim();
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const priceRaw = (formData.get("price") as string)?.trim();
  const priceAmount = priceRaw ? Number.parseInt(priceRaw, 10) : null;
  const usersLimitRaw = (formData.get("usersLimit") as string)?.trim();
  const storageRaw = (formData.get("storageGB") as string)?.trim();
  const bandwidthRaw = (formData.get("bandwidthGB") as string)?.trim();
  const propertiesRaw = (formData.get("propertiesLimit") as string)?.trim();
  const leadsRaw = (formData.get("leadsLimit") as string)?.trim();
  const estatesRaw = (formData.get("estatesLimit") as string)?.trim();

  if (!name) return;

  await createSubscriptionPlan({
    name,
    category: category || null,
    description: description || null,
    billingCycle: billingCycle || "monthly",
    currency,
    priceAmount: Number.isFinite(priceAmount || undefined) ? priceAmount : null,
    usersLimit: usersLimitRaw ? Number.parseInt(usersLimitRaw, 10) : null,
    storageGB: storageRaw ? Number.parseInt(storageRaw, 10) : null,
    bandwidthGB: bandwidthRaw ? Number.parseInt(bandwidthRaw, 10) : null,
    propertiesLimit: propertiesRaw ? Number.parseInt(propertiesRaw, 10) : null,
    leadsLimit: leadsRaw ? Number.parseInt(leadsRaw, 10) : null,
    estatesLimit: estatesRaw ? Number.parseInt(estatesRaw, 10) : null,
  });
  revalidatePath("/administration");
}

async function togglePlanStatusAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string) ?? "";
  const active = (formData.get("active") as string) === "true";
  if (!id) return;
  await setSubscriptionPlanActive(id, active);
  revalidatePath("/administration");
}

async function updatePlanAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const billingCycle = (formData.get("billingCycle") as string)?.trim();
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const priceRaw = (formData.get("price") as string)?.trim();
  const priceAmount = priceRaw ? Number.parseInt(priceRaw, 10) : null;
  const usersLimitRaw = (formData.get("usersLimit") as string)?.trim();
  const storageRaw = (formData.get("storageGB") as string)?.trim();
  const bandwidthRaw = (formData.get("bandwidthGB") as string)?.trim();
  const propertiesRaw = (formData.get("propertiesLimit") as string)?.trim();
  const leadsRaw = (formData.get("leadsLimit") as string)?.trim();
  const estatesRaw = (formData.get("estatesLimit") as string)?.trim();

  if (!id || !name) return;

  await updateSubscriptionPlan(id, {
    name,
    category: category || null,
    description: description || null,
    billingCycle: billingCycle || "monthly",
    currency,
    priceAmount: Number.isFinite(priceAmount || undefined) ? priceAmount : null,
    usersLimit: usersLimitRaw ? Number.parseInt(usersLimitRaw, 10) : null,
    storageGB: storageRaw ? Number.parseInt(storageRaw, 10) : null,
    bandwidthGB: bandwidthRaw ? Number.parseInt(bandwidthRaw, 10) : null,
    propertiesLimit: propertiesRaw ? Number.parseInt(propertiesRaw, 10) : null,
    leadsLimit: leadsRaw ? Number.parseInt(leadsRaw, 10) : null,
    estatesLimit: estatesRaw ? Number.parseInt(estatesRaw, 10) : null,
  });
  revalidatePath("/administration");
}

async function updateSignupPlanAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string) ?? "";
  const planId = (formData.get("planId") as string)?.trim() || null;
  if (!id) return;
  await updateSignupPlan(id, planId);
  revalidatePath("/administration?tab=approvals");
}

export default async function AdministrationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: TabKey; drawer?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (!session || session.role !== "owner") {
    redirect("/login");
  }

  const activeTab: TabKey = params?.tab === "approvals" ? "approvals" : "plans";
  const drawerMode = params?.drawer === "edit" ? "edit" : params?.drawer === "new" ? "new" : null;
  const drawerPlanId = params?.plan?.trim();

  const [requests, plans] = await Promise.all([
    listSignupRequests(),
    listSubscriptionPlans(),
  ]);

  const planToEdit = drawerPlanId ? plans.find((p) => p.id === drawerPlanId) : undefined;
  const planFormAction = planToEdit ? updatePlanAction : createPlanAction;

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
        <p className="pill text-xs">Administration</p>
      </div>

      <div className="border-b border-white/10 flex gap-3 text-sm mb-4">
        <a
          href="/administration?tab=plans"
          className={`px-3 py-2 border-b-2 ${activeTab === "plans" ? "border-brand-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
        >
          Subscription programs
        </a>
        <a
          href="/administration?tab=approvals"
          className={`px-3 py-2 border-b-2 ${activeTab === "approvals" ? "border-brand-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
        >
          New registrations
        </a>
      </div>

      {activeTab === "plans" && (
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Subscription programs</p>
              <p className="muted text-sm">Review and manage available plans.</p>
            </div>
            <a href="/administration?tab=plans&drawer=new" className="btn-primary text-sm">Add subscription</a>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plans.length === 0 && <p className="text-sm text-slate-300">No subscription categories yet.</p>}
            {plans.map((plan) => (
              <div key={plan.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{plan.name}</p>
                    <p className="muted text-xs">{plan.category || "Uncategorized"}</p>
                  </div>
                  <span className="pill text-xs">{plan.isActive ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <p className="text-sm text-white">{plan.currency}{plan.priceAmount ? ` ${plan.priceAmount}` : ""} / {plan.billingCycle}</p>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>Users: {plan.usersLimit ?? "∞"} · Storage: {plan.storageGB ?? "∞"} GB · Bandwidth: {plan.bandwidthGB ?? "∞"} GB/mo</p>
                  <p>Properties: {plan.propertiesLimit ?? "∞"} · Leads: {plan.leadsLimit ?? "∞"} · Estates: {plan.estatesLimit ?? "∞"}</p>
                </div>
                {plan.description && <p className="text-xs text-slate-300">{plan.description}</p>}
                <div className="flex justify-end gap-2">
                  <a href={`/administration?tab=plans&drawer=edit&plan=${plan.id}`} className="btn-ghost text-xs">Edit</a>
                  <form action={togglePlanStatusAction}>
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="active" value={(!plan.isActive).toString()} />
                    <button type="submit" className="btn-ghost text-xs">{plan.isActive ? "Disable" : "Enable"}</button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {drawerMode && (drawerMode === "new" || (drawerMode === "edit" && planToEdit)) && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-20">
              <div className="w-full max-w-xl h-full bg-slate-950 border-l border-white/10 shadow-2xl overflow-y-auto">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{planToEdit ? "Edit subscription" : "Create subscription"}</p>
                    <p className="muted text-sm">Define pricing, limits, and terms.</p>
                  </div>
                  <a href="/administration?tab=plans" className="btn-ghost text-sm">Close</a>
                </div>
                <div className="p-5 space-y-3">
                  <form action={planFormAction} className="grid gap-3 md:grid-cols-2">
                    {planToEdit && <input type="hidden" name="id" value={planToEdit.id} />}
                    <label className="space-y-1 text-sm text-slate-200">
                      <span className="block text-xs text-slate-400">Name *</span>
                      <input name="name" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Enterprise Plus" defaultValue={planToEdit?.name ?? ""} />
                    </label>
                    <label className="space-y-1 text-sm text-slate-200">
                      <span className="block text-xs text-slate-400">Category</span>
                      <input name="category" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Real Estate" defaultValue={planToEdit?.category ?? ""} />
                    </label>
                    <label className="space-y-1 text-sm text-slate-200">
                      <span className="block text-xs text-slate-400">Price</span>
                      <input name="price" type="number" min="0" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="2999" defaultValue={planToEdit?.priceAmount ?? ""} />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Currency</span>
                        <select name="currency" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" defaultValue={planToEdit?.currency ?? "EGP"}>
                          <option value="EGP">EGP</option>
                          <option value="USD">USD</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Billing cycle</span>
                        <select name="billingCycle" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" defaultValue={planToEdit?.billingCycle ?? "monthly"}>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:col-span-2">
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Max users</span>
                        <input name="usersLimit" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="50" defaultValue={planToEdit?.usersLimit ?? ""} />
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Disk space (GB)</span>
                        <input name="storageGB" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="200" defaultValue={planToEdit?.storageGB ?? ""} />
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Bandwidth (GB/mo)</span>
                        <input name="bandwidthGB" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="500" defaultValue={planToEdit?.bandwidthGB ?? ""} />
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Properties limit</span>
                        <input name="propertiesLimit" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="1000" defaultValue={planToEdit?.propertiesLimit ?? ""} />
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Leads limit</span>
                        <input name="leadsLimit" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="10000" defaultValue={planToEdit?.leadsLimit ?? ""} />
                      </label>
                      <label className="space-y-1 text-sm text-slate-200">
                        <span className="block text-xs text-slate-400">Estates limit</span>
                        <input name="estatesLimit" type="number" min="1" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="500" defaultValue={planToEdit?.estatesLimit ?? ""} />
                      </label>
                    </div>
                    <label className="space-y-1 text-sm text-slate-200 md:col-span-2">
                      <span className="block text-xs text-slate-400">Description / requirements</span>
                      <textarea name="description" rows={3} className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Include terms, quota, and onboarding requirements." defaultValue={planToEdit?.description ?? ""} />
                    </label>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" className="btn-primary text-sm">{planToEdit ? "Update subscription" : "Save subscription"}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="text-white font-semibold">Pending approvals</p>
                <p className="muted">Review requested plans and credentials</p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px] divide-y divide-white/5">
                  {requests.length === 0 && <p className="text-sm text-slate-300 py-3">No signup requests yet.</p>}
                  {requests.map((req) => (
                    <div key={req.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 py-3 items-start text-sm">
                      <div className="space-y-1">
                        <p className="text-white font-semibold">{req.company}</p>
                        <p className="muted text-xs">{req.mobile} · {req.email || "No email"}</p>
                          <form action={updateSignupPlanAction} className="flex items-center gap-2 text-xs text-slate-200 mt-1">
                            <input type="hidden" name="id" value={req.id} />
                            <select
                              name="planId"
                              className="rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-white text-xs"
                              defaultValue={req.subscriptionPlan?.id || (plans[0]?.id ?? "")}
                            >
                              {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>{plan.name} · {plan.currency}{plan.priceAmount ? ` ${plan.priceAmount}` : ""}/{plan.billingCycle}</option>
                              ))}
                            </select>
                            <button type="submit" className="btn-ghost text-xs">Assign</button>
                          </form>
                        <form action={setPasswordAction} className="flex items-center gap-2 mt-2">
                          <input type="hidden" name="id" value={req.id} />
                          <input
                            name="password"
                            placeholder="Set password"
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-xs text-white"
                            defaultValue={req.password ?? ""}
                          />
                          <button type="submit" className="btn-ghost text-xs">Save</button>
                        </form>
                      </div>

                      <div className="space-y-1 text-slate-200">
                        <p className="text-xs text-slate-400">Limits</p>
                        <p className="text-xs text-slate-300">Users: {req.subscriptionPlan?.usersLimit ?? "∞"}</p>
                        <p className="text-xs text-slate-300">Storage: {req.subscriptionPlan?.storageGB ?? "∞"} GB</p>
                        <p className="text-xs text-slate-300">Bandwidth: {req.subscriptionPlan?.bandwidthGB ?? "∞"} GB/mo</p>
                      </div>

                      <div className="space-y-1 text-slate-200">
                        <p className="text-xs text-slate-400">Capacities</p>
                        <p className="text-xs text-slate-300">Properties: {req.subscriptionPlan?.propertiesLimit ?? "∞"}</p>
                        <p className="text-xs text-slate-300">Leads: {req.subscriptionPlan?.leadsLimit ?? "∞"}</p>
                        <p className="text-xs text-slate-300">Estates: {req.subscriptionPlan?.estatesLimit ?? "∞"}</p>
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <p>Status: <span className="pill">{req.status}</span></p>
                        <p className="text-xs">Requested {req.createdAt.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <form action={approveAction}>
                          <input type="hidden" name="id" value={req.id} />
                          <button type="submit" className="btn-primary text-xs w-28">Approve</button>
                        </form>
                        <form action={rejectAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={req.id} />
                          <input
                            name="note"
                            placeholder="Reason"
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-xs text-white"
                          />
                          <button type="submit" className="btn-ghost text-xs">Reject</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardShell>
  );
}
