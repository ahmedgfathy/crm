import Link from "next/link";

export default function InternalHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          Contaboo CRM
        </Link>
        <nav className="text-sm text-slate-300 flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/login" className="hover:text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
}
