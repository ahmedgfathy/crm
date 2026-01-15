import Link from "next/link";
import { ReactNode } from "react";
import { getSession, logout } from "../lib/auth";
import Logo from "./Logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Profile", href: "/profile", icon: "👤" },
  { label: "Properties", href: "/properties", icon: "🏢" },
  { label: "Leads", href: "/leads", icon: "📞" },
  { label: "Opportunity", href: "/opportunity", icon: "💼" },
  { label: "Primary", href: "/primary", icon: "🚧" },
  { label: "Document", href: "/document", icon: "📄" },
  { label: "Reports", href: "/reports", icon: "📊" },
  { label: "Management", href: "/management", icon: "⚙️" },
];

const topActions = [
  { label: "Translate", href: "#translate", icon: "🌐" },
  { label: "Notifications", href: "#notifications", icon: "🔔" },
  { label: "Mail", href: "#mail", icon: "✉️" },
  { label: "Calendar", href: "#calendar", icon: "📅" },
  { label: "Logout", icon: "⏻" },
];

export default async function DashboardShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isSuperAdmin = session?.mobile === "01002778090";
  const items = isSuperAdmin
    ? [...navItems, { label: "Administration", href: "/administration", icon: "🛡️" }]
    : navItems;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-[240px_1fr]">
      <aside className="border-r border-white/10 bg-slate-950/90 backdrop-blur flex flex-col">
        <div className="h-14 px-6 flex items-center text-lg font-semibold">
          <Logo href="/dashboard" size="sm" />
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium"
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="h-14 border-b border-white/10 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6">
          <div className="text-sm text-slate-300">Contaboo</div>
          <div className="flex items-center gap-2">
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
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-10 bg-gradient-to-b from-slate-950 to-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
