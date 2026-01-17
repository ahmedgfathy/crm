import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const MODULES = [
  "dashboard",
  "profile",
  "contacts",
  "organization",
  "properties",
  "leads",
  "opportunity",
  "primary",
  "document",
  "reports",
  "management",
  "administration",
];

async function createPermissionClassAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!name) return;
  await prisma.permissionClass.create({ data: { name, description: description || null } });
  revalidatePath("/management");
}

async function createRuleAction(formData: FormData) {
  "use server";
  const permissionClassId = (formData.get("permissionClassId") as string)?.trim();
  const module = (formData.get("module") as string)?.trim();
  const resource = (formData.get("resource") as string)?.trim();
  const canRead = formData.get("canRead") === "on";
  const canCreate = formData.get("canCreate") === "on";
  const canUpdate = formData.get("canUpdate") === "on" || canCreate;
  const canDelete = formData.get("canDelete") === "on";
  if (!permissionClassId || !module) return;
  const effectiveRead = canRead || (!canCreate && !canUpdate && !canDelete);
  await prisma.permissionRule.create({
    data: {
      permissionClassId,
      module,
      resource: resource || null,
      canRead: effectiveRead,
      canCreate,
      canUpdate,
      canDelete,
    },
  });
  revalidatePath("/management");
}

async function createRoleAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const permissionClassId = (formData.get("permissionClassId") as string)?.trim();
  if (!name || !permissionClassId) return;
  await prisma.role.create({ data: { name, description: description || null, permissionClassId } });
  revalidatePath("/management");
}

async function assignRoleAction(formData: FormData) {
  "use server";
  const userId = (formData.get("userId") as string)?.trim();
  const roleId = (formData.get("roleId") as string)?.trim();
  if (!userId || !roleId) return;
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });
  revalidatePath("/management");
}

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const params = await searchParams;
  const activeTab = params?.tab ?? "permissions";

  const [permissionClasses, roles, users, assignments] = await Promise.all([
    prisma.permissionClass.findMany({ include: { rules: true }, orderBy: { createdAt: "desc" } }),
    prisma.role.findMany({ include: { permissionClass: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.userRole.findMany({ include: { user: true, role: { include: { permissionClass: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const tabs = [
    { key: "permissions", label: "Permissions" },
    { key: "roles", label: "Roles" },
    { key: "assignments", label: "Assignments" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-4 mb-2">
        <div className="space-y-1">
          <p className="pill">Management</p>
          <h1 className="text-3xl font-bold text-white">Management</h1>
          <p className="muted text-sm">RBAC designer for a single company: define permission classes, roles, and assignments.</p>
        </div>
      </div>

      <div className="border-b border-white/10 flex gap-2 text-sm mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`/management?tab=${tab.key}`}
            className={`px-3 py-2 border-b-2 ${activeTab === tab.key ? "border-brand-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div id="permission-class-form" className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Create permission class</p>
                <p className="muted text-xs">Bundle module + object rules</p>
              </div>
              <form action={createPermissionClassAction} className="space-y-3 text-sm">
                <label className="space-y-1 text-slate-200">
                  <span className="block text-xs text-slate-400">Name *</span>
                  <input name="name" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Marketing" />
                </label>
                <label className="space-y-1 text-slate-200">
                  <span className="block text-xs text-slate-400">Description</span>
                  <textarea name="description" rows={2} className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Access for marketing team" />
                </label>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary text-sm">Save class</button>
                </div>
              </form>
            </div>

            <div id="permission-rule-form" className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Add rule</p>
                <p className="muted text-xs">Module + object CRUD</p>
              </div>
              <form action={createRuleAction} className="grid gap-3 md:grid-cols-2 text-sm">
                <label className="space-y-1 text-slate-200 md:col-span-2">
                  <span className="block text-xs text-slate-400">Permission class *</span>
                  <select name="permissionClassId" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                    <option value="">Select a class</option>
                    {permissionClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-slate-200">
                  <span className="block text-xs text-slate-400">Module *</span>
                  <select name="module" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                    <option value="">Choose module</option>
                    {MODULES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-slate-200">
                  <span className="block text-xs text-slate-400">Resource / object</span>
                  <input name="resource" className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="project, unit, lead" />
                </label>
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-200">
                  <label className="flex items-center gap-2"><input type="checkbox" name="canRead" defaultChecked className="accent-brand-500" /> Read</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="canCreate" className="accent-brand-500" /> Create</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="canUpdate" className="accent-brand-500" /> Update</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="canDelete" className="accent-brand-500" /> Delete</label>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="btn-primary text-sm">Add rule</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">Permission classes</p>
                <p className="muted text-xs">Click to review rules</p>
              </div>
              <a href="#permission-class-form" className="btn-ghost text-xs">Create new</a>
            </div>
            <div className="divide-y divide-white/5">
              {permissionClasses.length === 0 && <p className="text-sm text-slate-300 py-3">No classes yet.</p>}
              {permissionClasses.map((cls) => (
                <div key={cls.id} className="py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{cls.name}</p>
                      <p className="muted text-xs">{cls.description || "No description"}</p>
                    </div>
                    <span className="pill text-xs">{cls.rules.length} rules</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-200">
                    {cls.rules.map((rule) => (
                      <div key={rule.id} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1">
                        <p className="text-white font-semibold text-sm">{rule.module}</p>
                        <p className="text-slate-300">{rule.resource || "All objects"}</p>
                        <p className="text-[11px] text-slate-400">R:{rule.canRead ? "Y" : "N"} C:{rule.canCreate ? "Y" : "N"} U:{rule.canUpdate ? "Y" : "N"} D:{rule.canDelete ? "Y" : "N"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-4">
          <div id="role-form" className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Create role</p>
              <p className="muted text-xs">Attach to a permission class</p>
            </div>
            <form action={createRoleAction} className="grid gap-3 md:grid-cols-2 text-sm">
              <label className="space-y-1 text-slate-200">
                <span className="block text-xs text-slate-400">Role name *</span>
                <input name="name" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Marketing Manager" />
              </label>
              <label className="space-y-1 text-slate-200">
                <span className="block text-xs text-slate-400">Permission class *</span>
                <select name="permissionClassId" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="">Choose class</option>
                  {permissionClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200 md:col-span-2">
                <span className="block text-xs text-slate-400">Description</span>
                <textarea name="description" rows={2} className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" placeholder="Role purpose" />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary text-sm">Save role</button>
              </div>
            </form>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">Roles</p>
                <p className="muted text-xs">Linked permission classes</p>
              </div>
              <a href="#role-form" className="btn-ghost text-xs">Create new</a>
            </div>
            <div className="divide-y divide-white/5 text-sm text-slate-200">
              {roles.length === 0 && <p className="text-slate-300 py-3">No roles yet.</p>}
              {roles.map((role) => (
                <div key={role.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{role.name}</p>
                    <p className="text-slate-300 text-xs">{role.description || "No description"}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Class: {role.permissionClass?.name || "None"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div id="assignment-form" className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Assign role to user</p>
              <p className="muted text-xs">Users inherit rules from roles</p>
            </div>
            <form action={assignRoleAction} className="grid gap-3 md:grid-cols-2 text-sm">
              <label className="space-y-1 text-slate-200">
                <span className="block text-xs text-slate-400">User *</span>
                <select name="userId" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email} — {u.mobile ?? "no mobile"}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-slate-200">
                <span className="block text-xs text-slate-400">Role *</span>
                <select name="roleId" required className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary text-sm">Assign</button>
              </div>
            </form>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">Current assignments</p>
                <p className="muted text-xs">Users → Roles → Permission class</p>
              </div>
              <a href="#assignment-form" className="btn-ghost text-xs">Create new</a>
            </div>
            <div className="divide-y divide-white/5 text-sm text-slate-200">
              {assignments.length === 0 && <p className="text-slate-300 py-3">No assignments yet.</p>}
              {assignments.map((a) => (
                <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{a.user.name || a.user.email}</p>
                    <p className="text-slate-300 text-xs">{a.user.email} · {a.user.mobile ?? "No mobile"}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Role: {a.role.name}</p>
                    <p>Class: {a.role.permissionClass?.name ?? "None"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
