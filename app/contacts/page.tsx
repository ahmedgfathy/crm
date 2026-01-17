import DashboardShell from "../../components/DashboardShell";
import { LocaleText } from "../../components/I18nProvider";

export const metadata = {
  title: "Contacts",
};

export default function ContactsPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="pill"><LocaleText id="nav.contacts">Contacts</LocaleText></p>
          <h1 className="text-3xl font-bold text-white"><LocaleText id="nav.contacts">Contacts</LocaleText></h1>
          <p className="muted text-sm">Centralize people and companies for the single organization.</p>
        </div>
        <div className="card p-6 text-slate-200">
          <p>Coming soon: contact directory, roles, groups, and sharing controls managed by IT admin.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
