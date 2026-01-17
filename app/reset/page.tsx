import Link from "next/link";
import InternalHeader from "../../components/InternalHeader";

export default function ResetPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-lg mx-auto card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white">Reset password</h1>
            <p className="muted">Contact your owner/IT admin to reset your credentials. Self-service resets are disabled.</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 space-y-1">
            <p className="text-white font-semibold">What to provide</p>
            <p className="text-slate-300">Share your work email and mobile so the admin can verify and issue a new temporary password.</p>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <Link href="/login" className="hover:text-white">Back to login</Link>
            <span className="text-slate-400">Access is provisioned by your admin.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
