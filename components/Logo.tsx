import Link from "next/link";

export default function Logo({ href = "/login", size = "md" }: { href?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-extrabold tracking-tight text-white logo-lockup ${sizeClass}`}
      aria-label="Contaboo"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-400 shadow-lg shadow-blue-500/30">
        <span className="absolute inset-[2px] rounded-lg bg-slate-950/80 backdrop-blur" />
        <span className="relative text-lg font-black text-white drop-shadow-sm">C</span>
      </span>
      <span className="leading-tight">
        <span className="block">Contaboo</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 logo-tagline">Real Estate CRM</span>
      </span>
    </Link>
  );
}
