export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20 bg-slate-950/70 backdrop-blur">
      <div className="container py-10 text-sm text-slate-300 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-white font-semibold">Contaboo</div>
        <div className="text-slate-400">
          © {new Date().getFullYear()} Contaboo. Real Estate SaaS — unlimited users, bandwidth, storage.
        </div>
        <div className="flex gap-4 text-slate-400">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#services" className="hover:text-white">Services</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
