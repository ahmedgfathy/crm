"use client";

import { useMemo } from "react";
import { LocaleText, useI18n } from "../../components/I18nProvider";

export function LoginClient({ loginAction, errorKey }: { loginAction: (formData: FormData) => void; errorKey: string | null }) {
  const { t } = useI18n();
  const errorMessage = useMemo(() => (errorKey ? t(errorKey) : null), [errorKey, t]);

  return (
    <main className="flex-1 py-16 px-6">
      <div className="max-w-lg mx-auto card p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white"><LocaleText id="login.title">Sign in</LocaleText></h1>
          <p className="muted"><LocaleText id="login.subtitle">Use your mobile number to access the dashboard.</LocaleText></p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="mobile">
              <LocaleText id="login.mobile">Mobile number</LocaleText>
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              required
              placeholder={t("login.mobile.placeholder", "0100 277 8090")}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="password">
              <LocaleText id="login.password">Password</LocaleText>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button type="submit" name="intent" value="login" className="btn-primary w-full justify-center">
            <LocaleText id="login.submit">Sign in</LocaleText>
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <span className="text-slate-400">
            <LocaleText id="login.register.disabled">Registration is managed by your admin.</LocaleText>
          </span>
          <a href="/reset" className="hover:text-white">
            <LocaleText id="login.forgot">Forgot password?</LocaleText>
          </a>
        </div>

      </div>
    </main>
  );
}
