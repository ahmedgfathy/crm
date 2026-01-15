import Link from "next/link";
import { getSession, logout } from "../lib/auth";

export default async function InternalHeader() {
  const session = await getSession();
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href={session ? "/dashboard" : "/login"} className="text-lg font-semibold text-white">
          Contaboo CRM
        </Link>
        <nav className="text-sm text-slate-300 flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <form action={logout}>
                <button type="submit" className="hover:text-white text-red-200">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
