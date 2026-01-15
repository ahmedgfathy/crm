import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { LocaleText } from "../../components/I18nProvider";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <div className="space-y-2">
        <p className="pill"><LocaleText id="dashboard.pill">Dashboard</LocaleText></p>
        <h1 className="text-3xl font-bold text-white"><LocaleText id="dashboard.title">Welcome, Super Admin</LocaleText></h1>
        <p className="muted">
          <LocaleText id="dashboard.subtitle" values={{ mobile: session.mobile }}>
            You are signed in as {session.mobile}. RBAC via Prisma will wire here.
          </LocaleText>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="card p-5" id="properties">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.properties">Properties</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.properties.desc">Listings, pipelines, and billing.</LocaleText></p>
        </div>
        <div className="card p-5" id="leads">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.leads">Leads</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.leads.desc">Capture, route, and qualify inbound.</LocaleText></p>
        </div>
        <div className="card p-5" id="project">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.project">Project</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.project.desc">Development and renovation workflows.</LocaleText></p>
        </div>
        <div className="card p-5" id="document">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.document">Document</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.document.desc">Contracts, approvals, and storage.</LocaleText></p>
        </div>
        <div className="card p-5" id="reports">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.reports">Reports</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.reports.desc">Performance, commissions, and exports.</LocaleText></p>
        </div>
        <div className="card p-5" id="management">
          <h3 className="text-lg font-semibold text-white"><LocaleText id="dashboard.card.management">Management</LocaleText></h3>
          <p className="muted mt-1 text-sm"><LocaleText id="dashboard.card.management.desc">Admin, roles, and settings.</LocaleText></p>
        </div>
      </div>
    </DashboardShell>
  );
}
