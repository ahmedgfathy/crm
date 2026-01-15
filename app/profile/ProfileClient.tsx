"use client";

import { FormEvent, useState } from "react";
import { useI18n, LocaleText } from "../../components/I18nProvider";

export type ProfileData = {
  name: string;
  email: string;
  mobile: string;
  role: string;
  timezone: string;
};

export default function ProfileClient({ data }: { data: ProfileData }) {
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useI18n();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Saved locally. Wire to backend when ready.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 space-y-2">
          <p className="muted text-xs"><LocaleText id="profile.name">Name</LocaleText></p>
          <p className="text-white text-xl font-semibold">{data.name}</p>
          <p className="text-slate-400 text-sm">{data.role}</p>
        </div>
        <div className="card p-5 space-y-2">
          <p className="muted text-xs"><LocaleText id="profile.contact">Contact</LocaleText></p>
          <p className="text-white text-xl font-semibold">{data.mobile}</p>
          <p className="text-slate-400 text-sm">{data.email}</p>
        </div>
        <div className="card p-5 space-y-2">
          <p className="muted text-xs"><LocaleText id="profile.timezone">Timezone</LocaleText></p>
          <p className="text-white text-xl font-semibold">{data.timezone}</p>
          <p className="text-slate-400 text-sm"><LocaleText id="profile.timezone.helper">Calendar, reminders, and SLAs</LocaleText></p>
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
            <p className="text-white font-semibold"><LocaleText id="profile.profile">Profile</LocaleText></p>
            <p className="muted text-xs"><LocaleText id="profile.profile.helper">Personal details</LocaleText></p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400"><LocaleText id="profile.fullName">Full name</LocaleText></span>
              <input defaultValue={data.name} name="name" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400"><LocaleText id="profile.email">Email</LocaleText></span>
              <input defaultValue={data.email} name="email" type="email" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400"><LocaleText id="profile.mobile">Mobile</LocaleText></span>
              <input defaultValue={data.mobile} name="mobile" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1 text-slate-200">
              <span className="block text-xs text-slate-400"><LocaleText id="profile.tz">Timezone</LocaleText></span>
              <input defaultValue={data.timezone} name="timezone" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="submit" className="btn-primary text-sm"><LocaleText id="profile.save">Save changes</LocaleText></button>
          </div>
        </form>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-white font-semibold"><LocaleText id="profile.security">Security</LocaleText></p>
            <p className="muted"><LocaleText id="profile.security.helper">Owner role</LocaleText></p>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span><LocaleText id="profile.password">Password</LocaleText></span>
              <button type="button" className="btn-ghost text-xs"><LocaleText id="profile.resetSoon">Reset soon</LocaleText></button>
            </div>
            <div className="flex items-center justify-between">
              <span><LocaleText id="profile.mfa">MFA</LocaleText></span>
              <span className="pill"><LocaleText id="profile.pending">Pending</LocaleText></span>
            </div>
            <p className="muted text-xs"><LocaleText id="profile.security.note">Wire real actions when auth provider is ready.</LocaleText></p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="text-white font-semibold"><LocaleText id="profile.notifications">Notifications</LocaleText></p>
          <p className="muted"><LocaleText id="profile.notifications.helper">Email & in-app</LocaleText></p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-200">
          {[
            t("profile.notifications.lead", "Lead assignment"),
            t("profile.notifications.document", "Document share"),
            t("profile.notifications.pipeline", "Pipeline change"),
            t("profile.notifications.billing", "Billing alerts"),
          ].map((item) => (
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
