import { getSession } from "../lib/auth";
import Logo from "./Logo";

export default async function InternalHeader() {
  const session = await getSession();
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Logo href={session ? "/dashboard" : "/login"} size="sm" />
        <div className="text-xs text-slate-400">Secure access</div>
      </div>
    </header>
  );
}
