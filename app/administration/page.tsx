import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { listSignupRequests, updateSignupStatus, updateSignupPassword } from "../../lib/signupStore";

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

export default async function AdministrationPage() {
  const session = await getSession();
  if (!session || session.mobile !== "01002778090") {
    redirect("/login");
  }

  const requests = await listSignupRequests();

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Administration</p>
        <p className="muted text-sm">Approve new company signups.</p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="text-white font-semibold">Pending requests</p>
          <p className="muted">Super admin only</p>
        </div>
        <div className="divide-y divide-white/5">
          {requests.length === 0 && <p className="text-sm text-slate-300 py-3">No signup requests yet.</p>}
          {requests.map((req) => (
            <div key={req.id} className="py-3 grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] text-sm items-center">
              <div>
                <p className="text-white font-semibold">{req.company}</p>
                <p className="muted text-xs">{req.mobile} · {req.email || "No email"}</p>
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
              <div className="text-slate-300">Status: <span className="pill">{req.status}</span></div>
              <div className="text-slate-300 text-xs">Requested {req.createdAt.toLocaleString()}</div>
              <div className="flex gap-2 justify-end">
                <form action={approveAction}>
                  <input type="hidden" name="id" value={req.id} />
                  <button type="submit" className="btn-primary text-xs">Approve</button>
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
    </DashboardShell>
  );
}
