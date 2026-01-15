import Link from "next/link";
import { ReactNode } from "react";
import { getSession, logout } from "../lib/auth";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { LocaleSwitcher, LocaleText } from "./I18nProvider";
import SidebarToggle from "./SidebarToggle";

const navItems = [
  { id: "nav.dashboard", label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { id: "nav.profile", label: "Profile", href: "/profile", icon: "👤" },
  { id: "nav.properties", label: "Properties", href: "/properties", icon: "🏢" },
  { id: "nav.leads", label: "Leads", href: "/leads", icon: "📞" },
  { id: "nav.opportunity", label: "Opportunity", href: "/opportunity", icon: "💼" },
  { id: "nav.primary", label: "Primary", href: "/primary", icon: "🚧" },
  { id: "nav.document", label: "Document", href: "/document", icon: "📄" },
  { id: "nav.reports", label: "Reports", href: "/reports", icon: "📊" },
  { id: "nav.management", label: "Management", href: "/management", icon: "⚙️" },
];
const topActions = [
  { label: "Notifications", href: "#notifications", icon: "🔔" },
  { label: "Mail", href: "#mail", icon: "✉️" },
  { label: "Calendar", href: "#calendar", icon: "📅" },
  { label: "Logout", icon: "⏻" },
];

export default async function DashboardShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "owner";
  const items = isSuperAdmin
    ? [...navItems, { id: "nav.administration", label: "Administration", href: "/administration", icon: "🛡️" }]
    : navItems;

  return (
    <div className="dashboard-shell min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r backdrop-blur flex flex-col">
        <div className="h-14 px-6 flex items-center text-lg font-semibold">
          <Logo href="/dashboard" size="sm" />
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium nav-item"
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="nav-label"><LocaleText id={item.id} fallback={item.label}>{item.label}</LocaleText></span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-white/10 flex items-center justify-center">
          <SidebarToggle />
        </div>
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="h-14 border-b backdrop-blur flex items-center justify-between px-6">
          <div className="text-sm text-slate-300">Contaboo</div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {topActions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  aria-label={action.label}
                  title={action.label}
                  className="px-3 py-2 text-lg rounded-lg hover:bg-white/5 border border-white/5"
                >
                  <span aria-hidden="true">{action.icon}</span>
                </Link>
              ) : (
                <form key={action.label} action={logout}>
                  <button
                    type="submit"
                    aria-label={action.label}
                    title={action.label}
                    className="px-3 py-2 text-lg rounded-lg hover:bg-white/5 border border-white/5 text-red-200"
                  >
                    <span aria-hidden="true">{action.icon}</span>
                  </button>
                </form>
              )
            )}
            <div className="ml-2 h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold">
              {isSuperAdmin ? "SA" : "MB"}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
