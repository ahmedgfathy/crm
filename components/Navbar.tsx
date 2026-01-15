import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-white">
          Contaboo
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-lg text-slate-200">
          <a href="#product" aria-label="Product" className="hover:text-white" title="Product">
            <span aria-hidden="true">📦</span>
          </a>
          <a href="#services" aria-label="Services" className="hover:text-white" title="Services">
            <span aria-hidden="true">🛠️</span>
          </a>
          <a href="#about" aria-label="About Us" className="hover:text-white" title="About Us">
            <span aria-hidden="true">🏢</span>
          </a>
          <a href="#contact" aria-label="Contact Us" className="hover:text-white" title="Contact Us">
            <span aria-hidden="true">✉️</span>
          </a>
          <Link href="/subscription" aria-label="Pricing" className="hover:text-white" title="Pricing">
            <span aria-hidden="true">💰</span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="#contact" className="btn-primary text-sm">Book a demo</a>
        </div>

        <div className="md:hidden">
          <button
            aria-label="open menu"
            className="px-3 py-2 rounded-lg border border-white/10 text-white"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
