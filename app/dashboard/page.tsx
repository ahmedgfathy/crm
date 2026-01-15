import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <div className="space-y-2">
        <p className="pill">Dashboard</p>
        <h1 className="text-3xl font-bold text-white">Welcome, Super Admin</h1>
        <p className="muted">You are signed in as {session.mobile}. RBAC via Prisma will wire here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="card p-5" id="properties">
          <h3 className="text-lg font-semibold text-white">Properties</h3>
          <p className="muted mt-1 text-sm">Listings, pipelines, and billing.</p>
        </div>
        <div className="card p-5" id="leads">
          <h3 className="text-lg font-semibold text-white">Leads</h3>
          <p className="muted mt-1 text-sm">Capture, route, and qualify inbound.</p>
        </div>
        <div className="card p-5" id="project">
          <h3 className="text-lg font-semibold text-white">Project</h3>
          <p className="muted mt-1 text-sm">Development and renovation workflows.</p>
        </div>
        <div className="card p-5" id="document">
          <h3 className="text-lg font-semibold text-white">Document</h3>
          <p className="muted mt-1 text-sm">Contracts, approvals, and storage.</p>
        </div>
        <div className="card p-5" id="reports">
          <h3 className="text-lg font-semibold text-white">Reports</h3>
          <p className="muted mt-1 text-sm">Performance, commissions, and exports.</p>
        </div>
        <div className="card p-5" id="management">
          <h3 className="text-lg font-semibold text-white">Management</h3>
          <p className="muted mt-1 text-sm">Admin, roles, and settings.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
