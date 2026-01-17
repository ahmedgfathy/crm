import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { LocaleText } from "../../components/I18nProvider";
import { prisma } from "../../lib/prisma";

type CountItem = { label: string; value: number; helper?: string };

function chip(value: string) {
  return value?.trim().toLowerCase();
}

function bucketCount(values: (string | null | undefined)[], matcher: (v: string) => boolean) {
  return values.reduce((acc, value) => (value && matcher(chip(value)) ? acc + 1 : acc), 0);
}

function tally(values: (string | null | undefined)[], fallback: string): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = (value && value.trim()) || fallback;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function lastMonths(windowSize = 6) {
  const now = new Date();
  return Array.from({ length: windowSize }, (_, idx) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (windowSize - 1 - idx), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("en", { month: "short" });
    return { key, label };
  });
}

function monthKey(value: Date) {
  const d = new Date(value);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [properties, leads] = await Promise.all([
    prisma.property.findMany({ select: { id: true, status: true, type: true, createdAt: true } }),
    prisma.lead.findMany({ select: { id: true, status: true, stage: true, source: true, createdAt: true } }),
  ]);

  const months = lastMonths(6);

  const propertyTypes = tally(properties.map((p) => p.type), "Unspecified");
  const leadSources = tally(leads.map((l) => l.source), "Unknown");
  const leadStages = tally(leads.map((l) => l.stage), "Unspecified");

  const metrics: CountItem[] = [
    { label: "Properties", value: properties.length, helper: "Inventory in pipeline" },
    { label: "Leads", value: leads.length, helper: "Contacts captured" },
    { label: "Top lead source", value: leadSources[0]?.count ?? 0, helper: leadSources[0]?.label ?? "No source" },
    { label: "Qualified leads", value: bucketCount(leads.map((l) => l.stage), (v) => v?.includes("qual")), helper: "Stage: Qualified" },
  ];

  const propertyMix = [
    { label: "Residential", count: bucketCount(properties.map((p) => p.type), (v) => v?.includes("res")) },
    { label: "Commercial", count: bucketCount(properties.map((p) => p.type), (v) => v?.includes("com")) },
  ];

  const saleVsRent = [
    { label: "For sale", count: bucketCount(properties.map((p) => p.status), (v) => v?.includes("sale")) },
    { label: "For rent", count: bucketCount(properties.map((p) => p.status), (v) => v?.includes("rent")) },
  ];

  const leadTimeline = months.map((m) => ({ label: m.label, count: leads.filter((l) => monthKey(l.createdAt) === m.key).length }));
  const propertyTimeline = months.map((m) => ({ label: m.label, count: properties.filter((p) => monthKey(p.createdAt) === m.key).length }));

  const activity = [...leads.map((l) => ({ type: "Lead", status: l.status, createdAt: l.createdAt })), ...properties.map((p) => ({ type: "Property", status: p.status, createdAt: p.createdAt }))]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <DashboardShell>
      <div className="space-y-2 mb-4">
        <p className="pill"><LocaleText id="dashboard.pill">Dashboard</LocaleText></p>
        <h1 className="text-3xl font-bold text-white"><LocaleText id="dashboard.title">Workspace overview</LocaleText></h1>
        <p className="muted">
          <LocaleText id="dashboard.subtitle" values={{ mobile: session.mobile }}>
            Latest properties, leads, and activity for your organization.
          </LocaleText>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="card p-5 space-y-2">
            <p className="muted text-xs">{item.label}</p>
            <p className="text-3xl font-semibold text-white">{item.value}</p>
            {item.helper && <p className="text-xs text-slate-400">{item.helper}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] mt-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Pipeline</p>
            <p className="muted">Last 6 months</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ title: "Leads", data: leadTimeline }, { title: "Properties", data: propertyTimeline }].map((block) => (
              <div key={block.title} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-white font-semibold">{block.title}</p>
                  <p className="muted">Trend</p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {block.data.map((point) => (
                    <div key={point.label} className="flex flex-col gap-1">
                      <div className="h-20 rounded-md bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-brand-500"
                          style={{ height: `${Math.min(100, (point.count || 0) * 12)}%` }}
                          aria-label={`${point.label} ${point.count}`}
                        />
                      </div>
                      <span className="text-xs text-slate-400 text-center">{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Activity</p>
            <p className="muted">Latest 8</p>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            {activity.length === 0 && <p className="text-slate-400">No recent activity.</p>}
            {activity.map((item, idx) => (
              <div key={`${item.type}-${idx}`} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <div>
                  <p className="text-white font-semibold">{item.type}</p>
                  <p className="text-xs text-slate-400">{item.status || "No status"}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr] xl:grid-cols-[1.1fr_1.1fr] mt-6">
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Property mix</p>
            <p className="muted">By type</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
            {propertyMix.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-white font-semibold">{item.label}</p>
                <p className="text-2xl font-semibold">{item.count}</p>
                <p className="text-xs text-slate-400">Inventory</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Sale vs Rent</p>
            <p className="muted">Status flags</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
            {saleVsRent.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-white font-semibold">{item.label}</p>
                <p className="text-2xl font-semibold">{item.count}</p>
                <p className="text-xs text-slate-400">Inventory</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr] mt-6">
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Lead sources</p>
            <p className="muted">Share</p>
          </div>
          <div className="space-y-3 text-sm text-slate-200">
            {leadSources.slice(0, 5).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (item.count / Math.max(1, leadSources[0]?.count ?? 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Lead stages</p>
            <p className="muted">Qualification</p>
          </div>
          <div className="space-y-3 text-sm text-slate-200">
            {leadStages.slice(0, 5).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (item.count / Math.max(1, leadStages[0]?.count ?? 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
