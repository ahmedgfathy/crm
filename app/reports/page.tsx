import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import ReportsClient, { ReportsData } from "./ReportsClient";

type LeadRow = { status: string; source: string | null; budget: number | null; createdAt: Date };
type PropertyRow = { status: string; type: string; price: number | null; createdAt: Date };

type MonthBucket = { key: string; label: string };

function rollingMonths(windowSize = 6): MonthBucket[] {
  const now = new Date();
  return Array.from({ length: windowSize }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (windowSize - 1 - index), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("en", { month: "short" });
    return { key, label };
  });
}

function monthKey(value: Date) {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function tally(values: (string | null | undefined)[], fallback: string): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = (value && value.trim()) || fallback;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function sum(values: (number | null | undefined)[]) {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [leadRows, propertyRows]: [LeadRow[], PropertyRow[]] = await Promise.all([
    prisma.lead.findMany({ select: { status: true, source: true, budget: true, createdAt: true } }),
    prisma.property.findMany({ select: { status: true, type: true, price: true, createdAt: true } }),
  ]);

  const months = rollingMonths(6);

  const leadBudgetTotal = sum(leadRows.map((lead) => lead.budget));
  const propertyPriceTotal = sum(propertyRows.map((property) => property.price));
  const reports: ReportsData = {
    leads: {
      total: leadRows.length,
      budgetTotal: leadBudgetTotal,
      avgBudget: leadRows.length ? Math.round(leadBudgetTotal / leadRows.length) : null,
      byStatus: tally(leadRows.map((lead) => lead.status), "Unspecified status"),
      bySource: tally(leadRows.map((lead) => lead.source), "Unknown source"),
      monthly: months.map((month) => ({
        label: month.label,
        count: leadRows.filter((lead) => monthKey(lead.createdAt) === month.key).length,
      })),
    },
    properties: {
      total: propertyRows.length,
      priceTotal: propertyPriceTotal,
      avgPrice: propertyRows.length ? Math.round(propertyPriceTotal / propertyRows.length) : null,
      byStatus: tally(propertyRows.map((property) => property.status), "Unspecified status"),
      byType: tally(propertyRows.map((property) => property.type), "Unspecified type"),
      monthly: months.map((month) => ({
        label: month.label,
        count: propertyRows.filter((property) => monthKey(property.createdAt) === month.key).length,
      })),
    },
  };

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Reports</p>
        <p className="muted text-sm">Pipeline health derived from leads and properties.</p>
      </div>

      <ReportsClient data={reports} />
    </DashboardShell>
  );
}
