"use client";

import { useMemo } from "react";

export type ReportsData = {
  leads: {
    total: number;
    budgetTotal: number;
    avgBudget: number | null;
    byStatus: { label: string; count: number }[];
    bySource: { label: string; count: number }[];
    monthly: { label: string; count: number }[];
  };
  properties: {
    total: number;
    priceTotal: number;
    avgPrice: number | null;
    byStatus: { label: string; count: number }[];
    byType: { label: string; count: number }[];
    monthly: { label: string; count: number }[];
  };
};

type ListItem = { label: string; count: number; percent: number };

const num = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="card p-5 space-y-2">
      <p className="muted text-xs">{label}</p>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function ProgressList({ title, items }: { title: string; items: ListItem[] }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-white font-semibold">{title}</p>
        <p className="muted">Share</p>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{item.label}</span>
              <span className="text-slate-400">{item.count} · {Math.round(item.percent)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${Math.max(item.percent, 2)}%` }}
                aria-label={`${item.label} ${item.percent.toFixed(0)} percent`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline({ title, points }: { title: string; points: { label: string; count: number }[] }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-white font-semibold">{title}</p>
        <p className="muted">Last months</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {points.map((point) => (
          <div key={point.label} className="space-y-1">
            <div className="text-xs text-slate-400">{point.label}</div>
            <div className="text-lg text-white font-semibold">{point.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsClient({ data }: { data: ReportsData }) {
  const leadStatus = useMemo<ListItem[]>(() => {
    const total = data.leads.total || 1;
    return data.leads.byStatus.map((item) => ({
      ...item,
      percent: (item.count / total) * 100,
    }));
  }, [data.leads.byStatus, data.leads.total]);

  const leadSource = useMemo<ListItem[]>(() => {
    const total = data.leads.total || 1;
    return data.leads.bySource.map((item) => ({
      ...item,
      percent: (item.count / total) * 100,
    }));
  }, [data.leads.bySource, data.leads.total]);

  const propertyStatus = useMemo<ListItem[]>(() => {
    const total = data.properties.total || 1;
    return data.properties.byStatus.map((item) => ({
      ...item,
      percent: (item.count / total) * 100,
    }));
  }, [data.properties.byStatus, data.properties.total]);

  const propertyType = useMemo<ListItem[]>(() => {
    const total = data.properties.total || 1;
    return data.properties.byType.map((item) => ({
      ...item,
      percent: (item.count / total) * 100,
    }));
  }, [data.properties.byType, data.properties.total]);

  const headline = [
    {
      label: "Leads in pipeline",
      value: num.format(data.leads.total),
      helper: data.leads.avgBudget
        ? `${currency.format(data.leads.avgBudget)} avg budget`
        : "No budget captured",
    },
    {
      label: "Properties tracked",
      value: num.format(data.properties.total),
      helper: data.properties.avgPrice
        ? `${currency.format(data.properties.avgPrice)} avg price`
        : "No pricing captured",
    },
    {
      label: "Total lead budget",
      value: data.leads.budgetTotal ? currency.format(data.leads.budgetTotal) : "—",
      helper: "Sum of all leads budget",
    },
    {
      label: "Property value",
      value: data.properties.priceTotal ? currency.format(data.properties.priceTotal) : "—",
      helper: "Sum of all asking prices",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {headline.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} helper={item.helper} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ProgressList title="Lead by status" items={leadStatus} />
        <Timeline title="Lead creation" points={data.leads.monthly} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ProgressList title="Lead sources" items={leadSource} />
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Top budgets</p>
            <p className="muted">Totals</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="muted">Total budget</p>
              <p className="text-white text-lg font-semibold">
                {data.leads.budgetTotal ? currency.format(data.leads.budgetTotal) : "No budgets"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="muted">Average budget</p>
              <p className="text-white text-lg font-semibold">
                {data.leads.avgBudget ? currency.format(data.leads.avgBudget) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ProgressList title="Property status" items={propertyStatus} />
        <Timeline title="Property intake" points={data.properties.monthly} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ProgressList title="Property mix" items={propertyType} />
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Pricing coverage</p>
            <p className="muted">Totals</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="muted">Total ask</p>
              <p className="text-white text-lg font-semibold">
                {data.properties.priceTotal ? currency.format(data.properties.priceTotal) : "No prices"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="muted">Average ask</p>
              <p className="text-white text-lg font-semibold">
                {data.properties.avgPrice ? currency.format(data.properties.avgPrice) : "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="muted">Highest type</p>
              <p className="text-white text-lg font-semibold">
                {propertyType[0] ? `${propertyType[0].label} (${compact.format(propertyType[0].count)})` : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="muted">Open inventory</p>
              <p className="text-white text-lg font-semibold">
                {propertyStatus[0] ? `${propertyStatus[0].label} (${compact.format(propertyStatus[0].count)})` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
