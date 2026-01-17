import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession, hashPassword } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { invalidateTranslationCache } from "../../lib/translations";

const ROLE_OPTIONS = ["owner", "it-admin", "manager", "sales", "viewer"];
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED"];
const LOCALE_OPTIONS = ["en", "ar"];

async function createUserAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const mobile = (formData.get("mobile") as string)?.trim();
  const role = (formData.get("role") as string)?.trim() || "viewer";
  const password = (formData.get("password") as string)?.trim();

  if (!email || !mobile || !password) return;

  const company = await prisma.company.findFirst({ select: { id: true } });
  const hashedPassword = hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: name || null,
      mobile,
      role: ROLE_OPTIONS.includes(role) ? role : "viewer",
      status: "ACTIVE",
      password: hashedPassword,
      companyId: company?.id ?? null,
    },
    create: {
      name: name || null,
      email,
      mobile,
      role: ROLE_OPTIONS.includes(role) ? role : "viewer",
      status: "ACTIVE",
      password: hashedPassword,
      companyId: company?.id ?? null,
    },
  });

  revalidatePath("/administration");
}

async function updateUserAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const status = (formData.get("status") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();
  if (!id) return;

  await prisma.user.update({
    where: { id },
    data: {
      role: ROLE_OPTIONS.includes(role ?? "") ? (role as string) : undefined,
      status: STATUS_OPTIONS.includes(status ?? "") ? (status as string) : undefined,
      password: newPassword ? hashPassword(newPassword) : undefined,
    },
  });

  revalidatePath("/administration");
}

async function updateTranslationAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const value = (formData.get("value") as string)?.trim();
  if (!id || !value) return;

  await prisma.translation.update({
    where: { id },
    data: { value },
  });

  invalidateTranslationCache();
  revalidatePath("/administration");
}

async function createTranslationAction(formData: FormData) {
  "use server";
  const key = (formData.get("key") as string)?.trim();
  const locale = (formData.get("locale") as string)?.trim();
  const value = (formData.get("value") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || null;

  if (!key || !locale || !value) return;

  await prisma.translation.upsert({
    where: { key_locale: { key, locale } },
    update: { value, category },
    create: { key, locale, value, category },
  });

  invalidateTranslationCache();
  revalidatePath("/administration");
}

export default async function AdministrationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    redirect("/login");
  }

  const params = await searchParams;
  const activeTab = params?.tab ?? "users";
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  
  const translations = await prisma.translation.findMany({
    orderBy: [{ locale: "asc" }, { key: "asc" }],
  });
  const categories = Array.from(new Set(translations.map((t) => t.category).filter(Boolean))) as string[];

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
        <p className="pill text-xs">Administration</p>
        <p className="muted text-sm">User directory, roles, audits, policies</p>
      </div>

      <div className="border-b border-white/10 flex gap-2 text-sm mb-4 overflow-x-auto">
        {[
          { key: "users", label: "Users" },
          { key: "translations", label: "Translations" },
          { key: "audit", label: "Audit" },
          { key: "security", label: "Security" },
          { key: "config", label: "Config" },
        ].map((tab) => (
          <a
            key={tab.key}
            href={`/administration?tab=${tab.key}`}
            className={`px-3 py-2 border-b-2 ${activeTab === tab.key ? "border-brand-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {activeTab === "users" && (
        <>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Create a user</p>
              <p className="muted text-sm">Owner/IT admin provisions accounts directly.</p>
            </div>
          </div>

          <form action={createUserAction} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-200">
              <span className="block text-xs text-slate-400">Name</span>
              <input
                name="name"
                placeholder="Fatima Hassan"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-200">
              <span className="block text-xs text-slate-400">Work email *</span>
              <input
                name="email"
                type="email"
                required
                placeholder="fatima@company.com"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-200">
              <span className="block text-xs text-slate-400">Mobile *</span>
              <input
                name="mobile"
                type="tel"
                required
                placeholder="0100 277 8090"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-200">
              <span className="block text-xs text-slate-400">Role</span>
              <select
                name="role"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                defaultValue="manager"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-200">
              <span className="block text-xs text-slate-400">Initial password *</span>
              <input
                name="password"
                type="password"
                required
                placeholder="Set a temporary password"
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
              />
            </label>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary text-sm">Save user</button>
            </div>
          </form>
        </div>

        <div className="card p-6 space-y-3">
          <p className="text-white font-semibold">Access guidance</p>
          <p className="muted text-sm">Single organization, centralized control.</p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>No public signups. IT admin invites users.</li>
            <li>Assign least-privilege roles per team.</li>
            <li>Deactivate accounts instead of deleting.</li>
          </ul>
        </div>
      </div>

      <div className="card p-6 mt-4 text-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">User directory</p>
            <p className="muted text-sm">Manage roles and status for everyone.</p>
          </div>
          <span className="pill text-xs">{users.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px] divide-y divide-white/5">
            {users.length === 0 && (
              <p className="text-sm text-slate-300 py-3">No users yet. Add your first teammate above.</p>
            )}
            {users.map((user) => (
              <form
                key={user.id}
                action={updateUserAction}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center py-3 text-sm"
              >
                <input type="hidden" name="id" value={user.id} />
                <div className="space-y-1">
                  <p className="text-white font-semibold">{user.name || "Unnamed user"}</p>
                  <p className="muted text-xs">{user.email} · {user.mobile ?? "No mobile"}</p>
                  <p className="text-xs text-slate-400">Created {user.createdAt.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Role</span>
                  <select
                    name="role"
                    defaultValue={user.role || "member"}
                    className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white text-sm"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Status</span>
                  <select
                    name="status"
                    defaultValue={user.status || "ACTIVE"}
                    className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Reset password</span>
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="Leave blank to keep"
                    className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>Company</p>
                  <p className="text-slate-200 text-sm">{user.companyId ? "Linked" : "Not linked"}</p>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-ghost text-xs">Update</button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === "translations" && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Add translation</p>
                <p className="muted text-sm">Create or update translation strings for any locale.</p>
              </div>
            </div>

            <form action={createTranslationAction} className="grid gap-3 md:grid-cols-4">
              <label className="space-y-1 text-sm text-slate-200">
                <span className="block text-xs text-slate-400">Key *</span>
                <input
                  name="key"
                  required
                  placeholder="nav.dashboard"
                  className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-200">
                <span className="block text-xs text-slate-400">Locale *</span>
                <select
                  name="locale"
                  required
                  className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                >
                  {LOCALE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-slate-200">
                <span className="block text-xs text-slate-400">Category</span>
                <input
                  name="category"
                  placeholder="Navigation"
                  list="category-list"
                  className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                />
                <datalist id="category-list">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </label>

              <label className="space-y-1 text-sm text-slate-200">
                <span className="block text-xs text-slate-400">Value *</span>
                <input
                  name="value"
                  required
                  placeholder="Dashboard"
                  className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                />
              </label>

              <div className="md:col-span-4 flex justify-end">
                <button type="submit" className="btn-primary text-sm">Save translation</button>
              </div>
            </form>
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Translation strings</p>
                <p className="muted text-sm">Edit any translation value. Changes apply immediately.</p>
              </div>
              <span className="pill text-xs">{translations.length} strings</span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[980px] divide-y divide-white/5">
                {translations.length === 0 && (
                  <p className="text-sm text-slate-300 py-3">No translations yet.</p>
                )}
                {translations.map((trans) => (
                  <form
                    key={trans.id}
                    action={updateTranslationAction}
                    className="grid grid-cols-[1fr_80px_120px_2fr_auto] gap-3 items-center py-3 text-sm"
                  >
                    <input type="hidden" name="id" value={trans.id} />
                    <div className="text-slate-200 font-mono text-xs truncate" title={trans.key}>
                      {trans.key}
                    </div>
                    <div>
                      <span className="pill text-[10px]">{trans.locale}</span>
                    </div>
                    <div className="text-xs text-slate-400">{trans.category || "—"}</div>
                    <div className="space-y-1">
                      <input
                        name="value"
                        defaultValue={trans.value}
                        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn-ghost text-xs">Update</button>
                    </div>
                  </form>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Audit log</p>
              <p className="muted text-sm">Track sensitive changes across the workspace.</p>
            </div>
            <span className="pill text-xs">Coming soon</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="text-slate-300">Examples of what we will capture:</p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
              <li>User creation, role changes, and suspensions</li>
              <li>Password resets, MFA enrollment, and policy updates</li>
              <li>Data exports, document shares, and permission edits</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Security & MFA</p>
              <p className="muted text-sm">Centralize password rules, MFA, and session limits.</p>
            </div>
            <span className="pill text-xs">Planning</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Password policy</p>
              <p className="text-slate-300">Define length, complexity, rotation, and reuse rules.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">MFA enforcement</p>
              <p className="text-slate-300">Require MFA per role or device posture.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Session controls</p>
              <p className="text-slate-300">Idle timeouts, device limits, and geo restrictions.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Incident readiness</p>
              <p className="text-slate-300">Alerting hooks for suspicious events.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Configuration</p>
              <p className="muted text-sm">Single-organization defaults and integrations.</p>
            </div>
            <span className="pill text-xs">Outline</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Org profile</p>
              <p className="text-slate-300">Name, domain, and branding fields.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Integrations</p>
              <p className="text-slate-300">Email/SMS gateways, storage, and SSO later.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Notifications</p>
              <p className="text-slate-300">Routing for critical events and daily digest.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-slate-200">
              <p className="text-white font-semibold">Data lifecycle</p>
              <p className="text-slate-300">Retention and export policies.</p>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
