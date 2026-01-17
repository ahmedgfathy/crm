import DashboardShell from "../../components/DashboardShell";
import { LocaleText } from "../../components/I18nProvider";

export const metadata = {
  title: "Organization",
};

export default function OrganizationPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="pill"><LocaleText id="nav.organization">Organization</LocaleText></p>
          <h1 className="text-3xl font-bold text-white"><LocaleText id="nav.organization">Organization</LocaleText></h1>
          <p className="muted text-sm">Single-company setup: IT admin manages users, roles, and permissions.</p>
        </div>
        <div className="card p-6 text-slate-200">
          <p>This area will hold org structure, teams, and settings for the single real estate company.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
