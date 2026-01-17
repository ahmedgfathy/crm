import Link from "next/link";
import InternalHeader from "../../components/InternalHeader";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <InternalHeader />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-2xl mx-auto card p-8 space-y-4">
          <h1 className="text-3xl font-bold text-white">Subscription flow removed</h1>
          <p className="muted">
            We no longer use public subscription plans or approval queues. Access is provisioned directly by the owner/IT admin.
          </p>

          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200 space-y-2">
            <p className="text-white font-semibold">Need access?</p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Ask your admin to create your account in Administration → User directory.</li>
              <li>They will share your temporary password and role.</li>
              <li>Use the login page to sign in once provisioned.</li>
            </ul>
          </div>

          <div className="text-sm text-slate-300">
            <Link className="hover:text-white" href="/login">Return to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
