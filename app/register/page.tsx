import Link from "next/link";
import InternalHeader from "../../components/InternalHeader";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-lg mx-auto card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white">Registration is managed by IT</h1>
            <p className="muted">Self-service signups are disabled. Ask your owner/IT admin to create your account in Administration → User directory.</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 space-y-2">
            <p className="text-white font-semibold">What to do next</p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Share your name, work email, mobile, and role with your admin.</li>
              <li>They will provision you directly and send a temporary password.</li>
              <li>Use the login page to sign in once provisioned.</li>
            </ul>
          </div>

          <div className="text-center text-sm text-slate-300">
            Ready to sign in? <Link className="hover:text-white" href="/login">Go to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
