"use client";

import { FormEvent, useState } from "react";

export type ProfileData = {
  name: string;
  email: string;
  mobile: string;
  role: string;
  timezone: string;
};

export default function ProfileClient({ data }: { data: ProfileData }) {
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Saved locally. Wire to backend when ready.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 space-y-2">
          <p className="muted text-xs">Name</p>
          <p className="text-white text-xl font-semibold">{data.name}</p>
          <p className="text-slate-400 text-sm">{data.role}</p>
        </div>
        <div className="card p-5 space-y-2">
          <p className="muted text-xs">Contact</p>
          <p className="text-white text-xl font-semibold">{data.mobile}</p>
          <p className="text-slate-400 text-sm">{data.email}</p>
        </div>
        <div className="card p-5 space-y-2">
          <p className="muted text-xs">Timezone</p>
          <p className="text-white text-xl font-semibold">{data.timezone}</p>
          <p className="text-slate-400 text-sm">Calendar, reminders, and SLAs</p>
        </div>
      </div>

      {message && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-4 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">Profile</p>
            <p className="muted text-xs">Personal details</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400">Full name</span>
              <input defaultValue={data.name} name="name" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400">Email</span>
              <input defaultValue={data.email} name="email" type="email" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400">Mobile</span>
              <input defaultValue={data.mobile} name="mobile" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400">Timezone</span>
              <input defaultValue={data.timezone} name="timezone" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="submit" className="btn-primary text-sm">Save changes</button>
          </div>
        </form>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold">Security</p>
            <p className="muted">Owner role</p>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>Password</span>
              <button type="button" className="btn-ghost text-xs">Reset soon</button>
            </div>
            <div className="flex items-center justify-between">
              <span>MFA</span>
              <span className="pill">Pending</span>
            </div>
            <p className="muted text-xs">Wire real actions when auth provider is ready.</p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="text-white font-semibold">Notifications</p>
          <p className="muted">Email & in-app</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-200">
          {["Lead assignment", "Document share", "Pipeline change", "Billing alerts"].map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-indigo-500" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
