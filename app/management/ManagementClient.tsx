"use client";

import { useMemo } from "react";

export type OnboardingItem = {
  title: string;
  owner: string;
  due: string;
  status: "Not started" | "In progress" | "Done";
  pillar: "People" | "Process" | "Systems";
};

export type Role = {
  name: string;
  reportsTo: string;
  goals: string[];
};

export type Policy = {
  title: string;
  summary: string;
  link?: string;
};

export type ManagementData = {
  headcount: number;
  newJoiners: number;
  openRoles: number;
  onboarding: OnboardingItem[];
  roles: Role[];
  policies: Policy[];
};

const pillClass = {
  "Not started": "bg-slate-800 text-slate-200 border border-white/5",
  "In progress": "bg-amber-500/15 text-amber-100 border border-amber-500/40",
  Done: "bg-green-500/15 text-green-100 border border-green-500/40",
};

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="card p-5 space-y-1">
      <p className="muted text-xs">{label}</p>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function OnboardingTable({ items }: { items: OnboardingItem[] }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">New joiner playbook</p>
        <p className="muted text-xs">30/60/90 coverage</p>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div key={item.title} className="py-3 grid grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr] gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-slate-400 text-xs">{item.pillar} pillar</p>
            </div>
            <div className="text-slate-300">Owner: {item.owner}</div>
            <div className="text-slate-300">Due: {item.due}</div>
            <div>
              <span className={`pill ${pillClass[item.status]}`}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesPanel({ roles }: { roles: Role[] }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-white font-semibold">Roles & outcomes</p>
        <p className="muted">Clarity</p>
      </div>
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="border border-white/5 rounded-lg p-4 space-y-2 bg-white/5">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">{role.name}</p>
              <p className="muted text-xs">Reports to {role.reportsTo}</p>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              {role.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyPanel({ policies }: { policies: Policy[] }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-white font-semibold">Policies</p>
        <p className="muted">Operating guardrails</p>
      </div>
      <div className="space-y-3 text-sm text-slate-200">
        {policies.map((policy) => (
          <div key={policy.title} className="border border-white/5 rounded-lg p-4 bg-white/5 space-y-1">
            <p className="text-white font-medium">{policy.title}</p>
            <p className="text-slate-300 text-sm">{policy.summary}</p>
            {policy.link && (
              <a className="text-indigo-300 text-xs hover:underline" href={policy.link} target="_blank" rel="noreferrer">
                View detail
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManagementClient({ data }: { data: ManagementData }) {
  const done = useMemo(() => data.onboarding.filter((item) => item.status === "Done").length, [data.onboarding]);
  const total = data.onboarding.length || 1;
  const progress = Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Headcount" value={String(data.headcount)} helper="Current active team" />
        <StatCard label="New joiners" value={String(data.newJoiners)} helper="Arriving this month" />
        <StatCard label="Open roles" value={String(data.openRoles)} helper="Backlog to hire" />
        <StatCard label="Onboarding" value={`${progress}%`} helper={`${done} of ${total} steps done`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <OnboardingTable items={data.onboarding} />
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">30/60/90 plan</p>
            <p className="muted">Managers</p>
          </div>
          <div className="space-y-3 text-sm text-slate-200">
            <div>
              <p className="text-white font-medium">Day 1-30</p>
              <p className="text-slate-300">Access, policies, shadowing, weekly check-ins, first OKRs drafted.</p>
            </div>
            <div>
              <p className="text-white font-medium">Day 31-60</p>
              <p className="text-slate-300">Own a deliverable, ship a process improvement, align with team rituals.</p>
            </div>
            <div>
              <p className="text-white font-medium">Day 61-90</p>
              <p className="text-slate-300">Lead a small project, document runbooks, hand off to next cohort.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <RolesPanel roles={data.roles} />
        <PolicyPanel policies={data.policies} />
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="text-white font-semibold">Manager checklist</p>
          <p className="muted">Weekly rhythm</p>
        </div>
        <ul className="list-disc list-inside text-sm text-slate-200 space-y-2">
          <li>1:1s with new joiners (30 mins) and skip-level once a month.</li>
          <li>Update hiring board, mark offers, and confirm start dates every Friday.</li>
          <li>Review onboarding tasks, remove blockers, and celebrate small wins.</li>
          <li>Keep policies visible: PTO, security, approvals, device standards.</li>
          <li>Publish a weekly note: decisions, risks, asks, and upcoming milestones.</li>
        </ul>
      </div>
    </div>
  );
}
